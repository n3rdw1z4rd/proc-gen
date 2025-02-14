import { BoxGeometry, Vector3 } from 'three';
import { FractalParams, PerlinNoise } from '../utils/perlin-noise';
import { log } from '../utils/logger';

export class CubeSphereGeometry extends BoxGeometry {
    private _halfSize: number;

    constructor(
        public readonly size: number,
        public readonly segments: number,
    ) {
        super(
            size, size, size,
            segments, segments, segments,
        );

        this._halfSize = (this.size / 2);
        this.applyNoise(0);
    }

    public applyNoise(scale: number, fractalParams?: FractalParams) {
        log('applyNoise:', scale, fractalParams);

        const attrPositions = this.attributes.position;
        const position = new Vector3();

        for (let i = 0; i < attrPositions.count; i++) {
            position.fromBufferAttribute(attrPositions, i);

            position.normalize().multiplyScalar(this._halfSize);

            const noise = (fractalParams !== undefined)
                ? PerlinNoise.fractal3D(position.x, position.y, position.z, fractalParams)
                : PerlinNoise.noise3D(position.x, position.y, position.z);

            const height = noise * scale;

            position.addScalar(height);

            attrPositions.setXYZ(i, position.x, position.y, position.z);
        }

        attrPositions.needsUpdate = true;
    }
}
