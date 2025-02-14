import { BoxGeometry, BufferGeometry, Vector3 } from 'three';
import { FractalParams, noise } from '../utils/perlin-noise';

// function fixIndices(geometry: BufferGeometry) {
//     const attrPositions = geometry.attributes.position;
//     const position = new Vector3();

//     for (let i = 0; i < attrPositions.count; i++) {
//         position.fromBufferAttribute(attrPositions, i);
//         position.normalize();
//         attrPositions.setXYZ(i, position.x, position.y, position.z);
//     }

//     attrPositions.needsUpdate = true;
//     // geometry.computeVertexNormals();
// }

export function NormalizeVertices(geometry: BufferGeometry) {
    if (!geometry.boundingBox) {
        geometry.computeBoundingBox;
    }

    // const radius = (geometry.boundingBox?.getSize())

    const attrPositions = geometry.attributes.position;
    const position = new Vector3();

    for (let i = 0; i < attrPositions.count; i++) {
        position.fromBufferAttribute(attrPositions, i);

        const length = position.length();

        position.normalize().multiplyScalar(length);
        attrPositions.setXYZ(i, position.x, position.y, position.z);
    }

    attrPositions.needsUpdate = true;
}

export function ApplyNoise(
    geometry: BufferGeometry,
    scale: number = 1.0,
    fractalParams?: FractalParams,
): void {
    const attrPositions = geometry.attributes.position;
    const attrNormals = geometry.attributes.normal;

    const position = new Vector3();
    const normal = new Vector3();

    for (let i = 0; i < attrPositions.count; i++) {
        position.fromBufferAttribute(attrPositions, i);
        normal.fromBufferAttribute(attrNormals, i);

        const n = noise(position.x, position.y, position.z, fractalParams);

        normal.normalize().multiplyScalar(1 + (n * scale));
        attrPositions.setXYZ(i, normal.x, normal.y, normal.z);
    }

    attrPositions.needsUpdate = true;
    // geometry.computeVertexNormals();
}

export function ApplyNoiseOg(
    geometry: BufferGeometry,
    scale: number = 1.0,
    fractalParams?: FractalParams,
): void {
    const attrPositions = geometry.attributes.position;
    const position = new Vector3();

    for (let i = 0; i < attrPositions.count; i++) {
        position.fromBufferAttribute(attrPositions, i);

        const n = noise(position.x, position.y, position.z, fractalParams);

        position.addScalar(n * scale);

        attrPositions.setXYZ(i, position.x, position.y, position.z);
    }

    attrPositions.needsUpdate = true;
    // geometry.computeVertexNormals();
}

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
        this._makeSphere();
    }

    private _makeSphere() {
        const attrPositions = this.attributes.position;
        const position = new Vector3();

        for (let i = 0; i < attrPositions.count; i++) {
            position.fromBufferAttribute(attrPositions, i);
            position.normalize().multiplyScalar(this._halfSize);
            attrPositions.setXYZ(i, position.x, position.y, position.z);
        }

        attrPositions.needsUpdate = true;
    }

    private _noiseNormals(scale: number = 1.0, fractalParams?: FractalParams) {
        const attrPositions = this.attributes.position;
        const attrNormals = this.attributes.normal;

        const position = new Vector3();
        const normal = new Vector3();

        for (let i = 0; i < attrPositions.count; i++) {
            position.fromBufferAttribute(attrPositions, i);
            normal.fromBufferAttribute(attrNormals, i);

            const l = position.length();
            const n = noise(position.x, position.y, position.z, fractalParams) * scale;

            normal.normalize().multiplyScalar(l + n);

            attrPositions.setXYZ(i, normal.x, normal.y, normal.z);
        }

        attrPositions.needsUpdate = true;
    }

    private _noiseVertices(scale: number = 1.0, fractalParams?: FractalParams) {
        const attrPositions = this.attributes.position;
        const position = new Vector3();

        for (let i = 0; i < attrPositions.count; i++) {
            position.fromBufferAttribute(attrPositions, i);

            const n = noise(position.x, position.y, position.z, fractalParams);

            position.multiplyScalar(this._halfSize + n * scale);

            attrPositions.setXYZ(i, position.x, position.y, position.z);
        }

        attrPositions.needsUpdate = true;
    }

    public applyNoise(scale: number = 1.0, fractalParams?: FractalParams) {
        this._noiseVertices(scale, fractalParams);
        // this._noiseNormals(scale, fractalParams);
    }
}
