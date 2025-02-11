import { BufferGeometry } from 'three';
import { noise, NoiseParams } from '../utils/noise';

// octaves: 3,
// frequency: 0.05,
// persistence: 0.5,
// amplitude: 4,

export function ApplyNoise(geometry: BufferGeometry, params: NoiseParams) {
    const vertices = geometry.getAttribute('position');

    if (vertices) {
        for (let c = 0; c < vertices.count; c++) {
            const xi = c * 3;
            const yi = xi + 1
            const zi = yi + 1;

            vertices.array[yi] = noise(vertices.array[xi], vertices.array[zi], params);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
}
