import { vec2 } from "gl-matrix";
import { rng } from "../core";
import { Map2D } from "../core/map2d";
import { Rectangle } from "../core/rectangle";
import { aStar } from "../core/a-star";

type RectPair = { a: Rectangle, b: Rectangle };
type PointPair = { a: Point, b: Point };

interface GenerateRoomsParams {
    minRoomSize?: number,
    maxRoomSize?: number,
    padding?: number,
    maxIterations?: number,
}

interface GeneratePathsParams {
    timeout?: number,
    extraPathLevel?: number,
    extraPathDensity?: number,
}

function generateRooms(mapSize: number, params: GenerateRoomsParams = {}): Rectangle[] {
    const minRoomSize = params.minRoomSize ?? 3;
    const maxRoomSize = params.maxRoomSize ?? 9;
    const padding = params.padding ?? 1;
    const maxIterations = params.maxIterations ?? 1000;

    const rooms: Rectangle[] = [];

    const getPosition = (): [number, number] => {
        const x = Math.floor(rng.range(1, mapSize - maxRoomSize));
        const y = Math.floor(rng.range(1, mapSize - maxRoomSize));

        return [x, y];
    };

    const getDimensions = (): [number, number] => {
        const baseSize = rng.range(minRoomSize, maxRoomSize);
        const aspectRatio = 0.75 + rng.parkMillerNormal() * 0.5; // Biased toward 1.0
        const roomWidth = Math.round(baseSize * aspectRatio);
        const roomHeight = Math.round(baseSize / aspectRatio);

        // Clamp dimensions to min/max
        const w = Math.min(maxRoomSize, Math.max(minRoomSize, roomWidth));
        const h = Math.min(maxRoomSize, Math.max(minRoomSize, roomHeight));

        return [w, h];
    };

    for (let i = 0; i < maxIterations; i++) {
        const [x, y] = getPosition();
        const [w, h] = getDimensions();

        const newRoom = new Rectangle(x, y, w, h);

        if (!rooms.some((existing: Rectangle) => newRoom.intersects(existing, padding))) {
            rooms.push(newRoom);
        }
    }

    return rooms;
}

function plotRooms(map: Map2D, rooms: Rectangle[], floorType: number = 1) {
    rooms.forEach((room: Rectangle) => {
        const x1 = room.x;
        const y1 = room.y;
        const x2 = x1 + room.w;
        const y2 = y1 + room.h;

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                if (
                    x >= 0 && y >= 0 &&
                    x < map.size && y < map.size
                ) {
                    map.set(x, y, floorType);
                }
            }
        }
    });
}

function getEdgePoints(rect: Rectangle): Point[] {
    const points: Point[] = [];

    const x2 = rect.x + rect.w;
    const y2 = rect.y + rect.h;

    for (let x1 = rect.x; x1 < x2; x1++) {
        points.push({ x: x1, y: rect.y });
        points.push({ x: x1, y: y2 });
    }

    for (let y1 = rect.y; y1 < y2; y1++) {
        points.push({ x: rect.x, y: y1 });
        points.push({ x: x2, y: y1 });
    }

    return points;
}

function getShortestPath(rectA: Rectangle, rectB: Rectangle): { a: Point, b: Point } {
    const edgeA = getEdgePoints(rectA);
    const edgeB = getEdgePoints(rectB);

    let paths = { a: edgeA[0], b: edgeB[0], distance: Infinity };

    for (const a of edgeA) {
        for (const b of edgeB) {
            const va = vec2.fromValues(a.x, a.y);
            const vb = vec2.fromValues(b.x, b.y);

            const d = vec2.distance(va, vb);

            if (d < paths.distance) {
                paths = { a, b, distance: d };
            }
        }
    }

    return { a: paths.a, b: paths.b };
}

function generatePaths(rooms: Rectangle[], map: Map2D, params: GeneratePathsParams = {}): Point[][] {
    const timeout = params.timeout ?? 5000;
    const extraPathLevel = params.extraPathLevel ?? 0;
    const extraPathDensity = params.extraPathDensity ?? 0.1;

    // build mst:
    const mst: RectPair[] = [];

    const pool: Rectangle[] = rooms.concat();
    const visited: Rectangle[] = [pool.shift()!];
    const extraPaths: RectPair[] = [];
    const startTime = Date.now();

    while (pool.length > 0 && Date.now() - startTime < timeout) {
        const indices: { a: number, b: number, d: number }[] = [];

        for (var v = 0; v < visited.length; v++) {
            for (var p = 0; p < pool.length; p++) {
                if (!visited[v].intersects(pool[p])) {
                    const d = vec2.distance(visited[v].center(), pool[p].center());
                    indices.push({ a: v, b: p, d });
                }
            }
        }

        indices.sort((a, b) => (a.d - b.d));

        mst.push({
            a: visited[indices[0].a],
            b: pool[indices[0].b],
        });

        for (var i = 1; i <= extraPathLevel; i++) {
            if (indices.length >= i) {
                extraPaths.push({
                    a: visited[indices[i].a],
                    b: pool[indices[i].b],
                });
            }
        }

        visited.push(pool.splice(indices[0].b, 1)[0])
    }

    extraPaths.forEach((path) => {
        if (rng.nextf < extraPathDensity) {
            mst.push(path);
        }
    });

    // get shortest path between rooms from mst:
    const paths: PointPair[] = [];

    for (let p = 0; p < mst.length; p++) {
        const path = mst[p];
        paths.push(getShortestPath(path.a, path.b));
    }

    // return aStarPaths:
    return paths.map((path: PointPair) => aStar(map.map, path.a, path.b, { useAdjacent: true }));
}

function plotPaths(map: Map2D, paths: Point[][], pathType: number = 2) {
    paths.forEach((points: Point[]) => {
        points.forEach((point: Point) => {
            map.set(point.x, point.y, pathType);
        });
    });
}

function generateDoors(paths: Point[][], map: Map2D): Point[] {
    const possibleDoorPoints: Point[] = [];

    paths.forEach((points: Point[]) => {
        if (points.length) {
            possibleDoorPoints.push(points.shift()!);

            if (points.length) possibleDoorPoints.push(points.pop()!);
        }
    });

    const doorPoints: Point[] = [];

    possibleDoorPoints.forEach((doorPoint: Point) => {
        if (
            (map.get(doorPoint.x, doorPoint.y - 1) === 0 && map.get(doorPoint.x, doorPoint.y + 1) === 0) ||
            (map.get(doorPoint.x - 1, doorPoint.y) === 0 && map.get(doorPoint.x + 1, doorPoint.y) === 0)
        ) {
            doorPoints.push(doorPoint);
        }
    });

    return doorPoints;
}

function plotWalls(map: Map2D, wallType: number = 3) {
    const directions: Point[] = [
        { x: -1, y: 0 }, // left
        { x: -1, y: -1 }, // left-up
        { x: 0, y: -1 }, // up
        { x: 1, y: -1 }, // up-right
        { x: 1, y: 0 },  // right
        { x: 1, y: 1 }, // right-down
        { x: 0, y: 1 },  // down
        { x: -1, y: 1 }, // down-left
    ];

    for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
            if ([1].includes(map.get(x, y))) {
                directions.forEach((dir: Point) => {
                    const nx = dir.x + x;
                    const ny = dir.y + y;

                    if (
                        nx >= 0 && ny >= 0 &&
                        nx < map.size && ny < map.size
                    ) {
                        if ([0].includes(map.get(nx, ny))) {
                            map.set(nx, ny, wallType)
                        }
                    }
                });
            }
        }
    }
}

const TILE_EMPTY = 0;
const TILE_FLOOR = 1;
const TILE_PATH = 2;
const TILE_WALL = 3;

export interface LevelParams {
    plotWalls?: boolean,
    roomPadding?: number,
}

export function GenerateRooms(mapSize: number | Map2D, params: LevelParams = {}): { map: Map2D, rooms: Rectangle[], paths: Point[][], doors: Point[] } {
    const map = (mapSize instanceof Map2D) ? mapSize : new Map2D(mapSize, TILE_EMPTY);

    mapSize = map.size;

    const rooms = generateRooms(map.size, { padding: params.roomPadding ?? 2 });

    plotRooms(map, rooms, TILE_FLOOR);

    const paths = generatePaths(rooms, map, { extraPathLevel: 0 });

    plotPaths(map, paths, TILE_PATH);

    const doors = generateDoors(paths, map);

    if (params.plotWalls === true) plotWalls(map, TILE_WALL);

    return { map, rooms, paths, doors };
}
