import { rng } from "../core";
import { Map2D } from "../core/map2d";
import { Rectangle } from "../core/rectangle";
import { GenerateRooms, LevelParams } from "../proc-gen/generate-rooms";

export function CreateLevel(mapSize: number = 32, params: LevelParams = {}): { map: Map2D, rooms: Rectangle[], paths: Point[][], doors: Point[] } {
    const bedrock = new Map2D(mapSize, 0);

    // random bedrock
    bedrock.forEach((x: number, y: number, v: number) => bedrock.set(x, y, (rng.nextf < 0.1) ? 8 : v));

    // rooms:
    const { map, doors, rooms, paths } = GenerateRooms(bedrock, params);

    // ground density map
    map.applyFractalBrownianMotion({ values: [4, 5, 6, 7], mask: 0 });

    // random ore
    // map.forEach((x: number, y: number, v: number) => {
    //     if (rng.nextf < 0.01 && v > 3 && v < 8) map.set(x, y, v + 6);
    // });

    return { map, doors, rooms, paths };
}