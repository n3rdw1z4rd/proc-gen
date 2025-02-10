import * as SimplexNoise from 'simplex-noise';
import { rng } from './rng';

export const createNoise2D = () => SimplexNoise.createNoise2D(() => rng.nextf);
export const createNoise3D = () => SimplexNoise.createNoise3D(() => rng.nextf);
export const createNoise4D = () => SimplexNoise.createNoise4D(() => rng.nextf);

export interface FractalNoiseParams {
    octaves: number,
    frequency: number,
    persistence: number,
    amplitude: number,
}

export function createFractalNoise2D() {
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

export function createFractalNoise3D() {
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
