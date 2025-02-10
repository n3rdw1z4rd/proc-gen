import * as SimplexNoise from 'simplex-noise';
import { rng } from './rng';

const createNoise2D = () => SimplexNoise.createNoise2D(() => rng.nextf);
const createNoise3D = () => SimplexNoise.createNoise3D(() => rng.nextf);
const createNoise4D = () => SimplexNoise.createNoise4D(() => rng.nextf);

export interface FractalNoiseParams {
    octaves: number,
    frequency: number,
    persistence: number,
    amplitude: number,
}

export type FractalNoiseFunction2D = (x: number, z: number, noiseParams: FractalNoiseParams) => number;

function createFractalNoise2D() {
    const noise = createNoise2D();

    return function (
        x: number,
        z: number,
        noiseParams: FractalNoiseParams,
    ) {
        let height = 0.0;

        for (let octave = 0; octave < noiseParams.octaves; octave++) {
            const freq = noiseParams.frequency * Math.pow(2, octave);
            const mult = (noiseParams.amplitude * Math.pow(noiseParams.persistence, octave));
            height += noise(x * freq, z * freq) * mult;;
        }

        height = height / (2 - 1 / Math.pow(2, noiseParams.octaves - 1));

        return (height + 1) / 2;
    }
};

export type FractalNoiseFunction3D = (x: number, y: number, z: number, noiseParams: FractalNoiseParams) => number;

function createFractalNoise3D() {
    const noise = createNoise3D();

    return function (
        x: number,
        y: number,
        z: number,
        noiseParams: FractalNoiseParams,
    ) {
        let height = 0.0;

        for (let octave = 0; octave < noiseParams.octaves; octave++) {
            const freq = noiseParams.frequency * Math.pow(2, octave);
            const mult = (noiseParams.amplitude * Math.pow(noiseParams.persistence, octave));
            height += noise(x * freq, y * freq, z * freq) * mult;;
        }

        height = height / (2 - 1 / Math.pow(2, noiseParams.octaves - 1));

        return (height + 1) / 2;
    }
};

// let _noise2d: SimplexNoise.NoiseFunction2D;
// export function Noise2D(x: number, y: number): number {
//     if (!_noise2d) {
//         _noise2d = SimplexNoise.createNoise2D(() => rng.nextf);
//     }

//     return _noise2d(x, y);
// }

class NoiseFactory {
    private static _instanceNoise2D: SimplexNoise.NoiseFunction2D;
    private static _instanceNoise3D: SimplexNoise.NoiseFunction3D;
    private static _instanceNoise4D: SimplexNoise.NoiseFunction4D;

    private static _instanceFractalNoise2D: FractalNoiseFunction2D;
    private static _instanceFractalNoise3D: FractalNoiseFunction3D;

    public static get noise2d(): SimplexNoise.NoiseFunction2D {
        if (!NoiseFactory._instanceNoise2D) {
            NoiseFactory._instanceNoise2D = createNoise2D();
        }

        return NoiseFactory._instanceNoise2D;
    }

    public static get noise3d(): SimplexNoise.NoiseFunction3D {
        if (!NoiseFactory._instanceNoise3D) {
            NoiseFactory._instanceNoise3D = createNoise3D();
        }

        return NoiseFactory._instanceNoise3D;
    }

    public static get noise4d(): SimplexNoise.NoiseFunction4D {
        if (!NoiseFactory._instanceNoise4D) {
            NoiseFactory._instanceNoise4D = createNoise4D();
        }

        return NoiseFactory._instanceNoise4D;
    }

    public static get fractal2d(): FractalNoiseFunction2D {
        if (!NoiseFactory._instanceFractalNoise2D) {
            NoiseFactory._instanceFractalNoise2D = createFractalNoise2D();
        }

        return NoiseFactory._instanceNoise2D;
    }

    public static get fractal3d(): FractalNoiseFunction3D {
        if (!NoiseFactory._instanceFractalNoise3D) {
            NoiseFactory._instanceFractalNoise3D = createFractalNoise3D();
        }

        return NoiseFactory._instanceNoise3D;
    }
}

export const noise2d = NoiseFactory.noise2d;
export const noise3d = NoiseFactory.noise3d;
export const noise4d = NoiseFactory.noise4d;
export const fractal2d = NoiseFactory.fractal2d;
export const fractal3d = NoiseFactory.fractal3d;
