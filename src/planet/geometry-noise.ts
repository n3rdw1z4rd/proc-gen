import { BufferGeometry } from 'three';
import { log } from '../utils/logger';
import { createFractalNoise2D, createFractalNoise3D, createNoise2D, createNoise3D } from '../utils/noise';

export interface AddNoiseParams {
    x: number,
    y?: number,
    z: number,
    octaves?: number,
    frequency?: number,
    persistence?: number,
    amplitude?: number,
}

// octaves: 3,
// frequency: 0.05,
// persistence: 0.5,
// amplitude: 4,

export function AddNoise(geometry: BufferGeometry, params: AddNoiseParams) {
    log('AddNoise:', geometry, params);

    let noiseFunc;

    if (
        params.octaves &&
        params.frequency &&
        params.persistence &&
        params.amplitude
    ) {
        if (!params.y)
            noiseFunc = createFractalNoise2D();
        else
            noiseFunc = createFractalNoise3D();
    } else {
        if (!params.y)
            noiseFunc = createNoise2D();
        else
            noiseFunc = createNoise3D();
    }
}
