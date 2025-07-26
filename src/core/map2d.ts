import { clamp } from './math';
import { Noise } from './noise';

export type ApplyCallback = (a: number, b: number) => number;

export interface ApplyFractalBrownianMotionParams {
    z?: number,
    values?: number[],
    mask?: number,
    amplitude?: number,
    frequency?: number,
    octaves?: number,
    persistence?: number,
    lacunarity?: number,
    replaceFunction?: (a: number, b: number) => boolean,
}

export class Map2D {
    map: number[][];

    get size(): number { return this.map.length; }

    constructor(size: number | Map2D, defaultValue: number = 0) {
        this.map =
            (size instanceof Map2D)
                ? [...size.map]
                : Array.from({ length: size }, () => new Array<number>(size).fill(defaultValue));
    }

    get(x: number, y: number): number {
        let value = -1;

        if (x >= 0 && y >= 0 && x < this.size - 1 && y < this.size)
            value = this.map[y][x];

        return value;
    }

    set(x: number, y: number, value: number) {
        if (x >= 0 && y >= 0 && x < this.size - 1 && y < this.size)
            this.map[y][x] = value;
    }

    applyMap(map: Map2D, mask: number | ApplyCallback = -1, valueOffset: number = 0) {
        if (map.size === this.size) {
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    if (typeof mask === 'function') {
                        this.map[y][x] = mask(this.get(x, y), map.get(x, y));
                    } else if (mask === -1 || this.map[y][x] === mask) {
                        this.map[y][x] = map.map[y][x] + valueOffset;
                    }
                }
            }
        }
    }

    applyFractalBrownianMotion(params: ApplyFractalBrownianMotionParams = {}) {
        const z = params.z ?? 0;
        const values = params.values ?? [0, 1, 2, 3];
        const mask = params.mask ?? -1;

        const replaceFunction = params.replaceFunction ?? ((_a: number, _b: number): boolean => {
            return mask === -1 ? true : (_a === mask);
        });

        const amplitude = params.amplitude ?? 1.0;
        const frequency = params.frequency ?? 0.01;
        const octaves = params.octaves ?? 1;
        const persistence = params.persistence ?? 0.5;
        const lacunarity = params.lacunarity ?? 2.0;

        if (values.length) {
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    const h = (1.0 + Noise.fractal3d(
                        x, y, z, {
                        amplitude,
                        frequency,
                        octaves,
                        persistence,
                        lacunarity,
                    })) * 0.5;

                    const tile = Math.floor(h * values.length);
                    clamp(tile, 0, values.length - 1);

                    if (replaceFunction(this.map[y][x], values[tile])) this.set(x, y, values[tile]);
                }
            }
        }
    }

    forEach(callback: (x: number, y: number, v: number) => void) {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                callback(x, y, this.map[y][x]);
            }
        }
    }
}
