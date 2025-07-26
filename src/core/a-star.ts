export interface AstarPoint {
    x: number,
    y: number,
}

interface Node {
    pos: AstarPoint;
    g: number;
    h: number;
    f: number;
    parent?: Node;
}

const directions: AstarPoint[] = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
];

function manhattan(a: AstarPoint, b: AstarPoint): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function isWalkable(grid: number[][], point: AstarPoint, walkable: number[] = [0]): boolean {
    return (
        point.y >= 0 && point.y < grid.length &&
        point.x >= 0 && point.x < grid[0].length &&
        walkable.includes(grid[point.y][point.x])
    );
}

export interface aStarParams {
    useAdjacent?: boolean,
    walkableValues?: number[],
}

export function aStar(grid: number[][], a: AstarPoint, b: AstarPoint, params: aStarParams = {}): AstarPoint[] {
    const useAdjacent = (params.useAdjacent === true);

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    const nodeMap = new Map<string, Node>();

    const startNode: Node = {
        pos: a,
        g: 0,
        h: manhattan(a, b),
        f: manhattan(a, b),
    };

    openSet.push(startNode);
    nodeMap.set(`${a.x},${a.y}`, startNode);

    let iterations = 0;

    const bPoints = [b.y * grid.length + b.x];

    if (useAdjacent === true) {
        for (const dir of directions) {
            bPoints.push((b.y + dir.y) * grid.length + (b.x + dir.x));
        }
    }

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);

        const current = openSet.shift()!;
        const currentIndex = current.pos.y * grid.length + current.pos.x;

        if (bPoints.includes(currentIndex)) {
            const path: AstarPoint[] = [];

            let curr: Node | undefined = current;

            while (curr) {
                path.push(curr.pos);
                curr = curr.parent;
            }

            path.pop();

            return path.reverse();
        }

        closedSet.add(`${current.pos.x},${current.pos.y}`);

        for (const dir of directions) {
            const neighborPos: AstarPoint = {
                x: current.pos.x + dir.x,
                y: current.pos.y + dir.y,
            };

            const key = `${neighborPos.x},${neighborPos.y}`;

            if (!isWalkable(grid, neighborPos, params.walkableValues) || closedSet.has(key)) continue;

            const g = current.g + 1;

            let neighbor = nodeMap.get(key);

            if (!neighbor) {
                neighbor = {
                    pos: neighborPos,
                    g,
                    h: manhattan(neighborPos, b),
                    f: g + manhattan(neighborPos, b),
                    parent: current,
                };

                nodeMap.set(key, neighbor);
                openSet.push(neighbor);
            } else if (g < neighbor.g) {
                neighbor.g = g;
                neighbor.f = g + neighbor.h;
                neighbor.parent = current;
            }
        }

        iterations++;
    }

    return []; // no path found
}
