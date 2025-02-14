import { rng } from './rng';

export interface FractalParams {
    octaves: number;
    frequency: number;
    persistence: number;
    amplitude: number;
    lacunarity: number;
}

export class PerlinNoise {
    private static gradients2D = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, Math.SQRT1_2],
        [Math.SQRT1_2, -Math.SQRT1_2], [-Math.SQRT1_2, -Math.SQRT1_2]
    ];

    private static gradients3D = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];

    private static perm = new Uint8Array(512);

    static {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng.nextf * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
        }
    }

    private static fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private static lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    private static dot2D(g: number[], x: number, y: number): number {
        return g[0] * x + g[1] * y;
    }

    private static dot3D(g: number[], x: number, y: number, z: number): number {
        return g[0] * x + g[1] * y + g[2] * z;
    }

    public static noise2D(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const g00 = this.gradients2D[this.perm[X + this.perm[Y]] % 8];
        const g10 = this.gradients2D[this.perm[X + 1 + this.perm[Y]] % 8];
        const g01 = this.gradients2D[this.perm[X + this.perm[Y + 1]] % 8];
        const g11 = this.gradients2D[this.perm[X + 1 + this.perm[Y + 1]] % 8];

        const n00 = this.dot2D(g00, x, y);
        const n10 = this.dot2D(g10, x - 1, y);
        const n01 = this.dot2D(g01, x, y - 1);
        const n11 = this.dot2D(g11, x - 1, y - 1);

        const nx0 = this.lerp(n00, n10, u);
        const nx1 = this.lerp(n01, n11, u);

        return this.lerp(nx0, nx1, v);
    }

    public static noise3D(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const g000 = this.gradients3D[this.perm[X + this.perm[Y + this.perm[Z]]] % 12];
        const g100 = this.gradients3D[this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12];
        const g010 = this.gradients3D[this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12];
        const g110 = this.gradients3D[this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12];

        const g001 = this.gradients3D[this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12];
        const g101 = this.gradients3D[this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12];
        const g011 = this.gradients3D[this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12];
        const g111 = this.gradients3D[this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12];

        const n000 = this.dot3D(g000, x, y, z);
        const n100 = this.dot3D(g100, x - 1, y, z);
        const n010 = this.dot3D(g010, x, y - 1, z);
        const n110 = this.dot3D(g110, x - 1, y - 1, z);
        const n001 = this.dot3D(g001, x, y, z - 1);
        const n101 = this.dot3D(g101, x - 1, y, z - 1);
        const n011 = this.dot3D(g011, x, y - 1, z - 1);
        const n111 = this.dot3D(g111, x - 1, y - 1, z - 1);

        const nx00 = this.lerp(n000, n100, u);
        const nx01 = this.lerp(n001, n101, u);
        const nx10 = this.lerp(n010, n110, u);
        const nx11 = this.lerp(n011, n111, u);

        const nxy0 = this.lerp(nx00, nx10, v);
        const nxy1 = this.lerp(nx01, nx11, v);

        return this.lerp(nxy0, nxy1, w);
    }

    public static fractal2D(x: number, y: number, fractalParams: FractalParams): number {
        let result = 0;

        // Compute Fractal Brownian Motion (FBM) noise
        let amplitude = fractalParams.amplitude;
        let frequency = fractalParams.frequency;

        for (let o = 0; o < fractalParams.octaves; o++) {
            result += PerlinNoise.noise2D(
                x * frequency,
                y * frequency,
            ) * amplitude;

            frequency *= fractalParams.lacunarity; // Increase frequency by lacunarity
            amplitude *= fractalParams.persistence; // Decrease amplitude
        }

        return result;
    }

    public static fractal3D(x: number, y: number, z: number, fractalParams: FractalParams): number {
        let result = 0;

        // Compute Fractal Brownian Motion (FBM) noise
        let amplitude = fractalParams.amplitude;
        let frequency = fractalParams.frequency;

        for (let o = 0; o < fractalParams.octaves; o++) {
            result += PerlinNoise.noise3D(
                x * frequency,
                y * frequency,
                z * frequency,
            ) * amplitude;

            frequency *= fractalParams.lacunarity; // Increase frequency by lacunarity
            amplitude *= fractalParams.persistence; // Decrease amplitude
        }

        return result;
    }
}

export function noise(x: number, y: number, z?: number | FractalParams, params?: FractalParams): number {
    if (typeof z !== 'number') {
        params = z;
        z = 0;
    }

    let result = 0.0;

    if (params) {
        if (!z) {
            result = PerlinNoise.fractal2D(x, y, params);
        } else {
            result = PerlinNoise.fractal3D(x, y, z, params);
        }
    } else {
        if (!z) {
            result = PerlinNoise.noise2D(x, y);
        } else {
            result = PerlinNoise.noise3D(x, y, z);
        }
    }

    return result;
}
