import { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute, Vector3 } from 'three';
import { FractalParams } from '../utils/perlin-noise';
import { PerlinNoise } from '../utils/perlin-noise';

export class SphericalBoxGeometry extends BufferGeometry {
    public minColor: number = 0.01;

    constructor(
        public readonly size: number,
        public readonly segments: number,
    ) {
        super();

        const halfSize = size / 2;
        const grid = segments + 1;
        const vertices = [];
        const indices = [];
        const normals = [];
        const uv = [];
        const vertexMap = new Map();

        const getIndex = (x: number, y: number, z: number) => `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;

        const faceNormals = [
            new Vector3(1, 0, 0), new Vector3(-1, 0, 0),
            new Vector3(0, 1, 0), new Vector3(0, -1, 0),
            new Vector3(0, 0, 1), new Vector3(0, 0, -1)
        ];

        for (let f = 0; f < 6; f++) {
            const normal = faceNormals[f];
            const uAxis = (f % 3) === 0 ? 1 : 0;
            const vAxis = (f % 3) === 1 ? 1 : 2;
            const sign = (f < 3) ? 1 : -1;

            for (let y = 0; y < grid; y++) {
                for (let x = 0; x < grid; x++) {
                    const u = (x / segments) * 2 - 1;
                    const v = (y / segments) * 2 - 1;

                    const position = new Vector3();
                    position.setComponent(uAxis, u * halfSize);
                    position.setComponent(vAxis, v * halfSize);
                    position.setComponent(3 - uAxis - vAxis, sign * halfSize);
                    position.normalize();

                    const key = getIndex(position.x, position.y, position.z);
                    if (!vertexMap.has(key)) {
                        vertexMap.set(key, vertices.length / 3);
                        vertices.push(position.x, position.y, position.z);
                        normals.push(normal.x, normal.y, normal.z);
                        uv.push(x / segments, 1 - y / segments);
                    }
                }
            }
        }

        for (let f = 0; f < 6; f++) {
            const normal = faceNormals[f];
            const uAxis = (f % 3) === 0 ? 1 : 0;
            const vAxis = (f % 3) === 1 ? 1 : 2;
            const sign = (f < 3) ? 1 : -1;

            for (let y = 0; y < segments; y++) {
                for (let x = 0; x < segments; x++) {
                    const u1 = (x / segments) * 2 - 1;
                    const v1 = (y / segments) * 2 - 1;
                    const u2 = ((x + 1) / segments) * 2 - 1;
                    const v2 = ((y + 1) / segments) * 2 - 1;

                    const p1 = new Vector3();
                    p1.setComponent(uAxis, u1 * halfSize);
                    p1.setComponent(vAxis, v1 * halfSize);
                    p1.setComponent(3 - uAxis - vAxis, sign * halfSize);
                    p1.normalize();

                    const p2 = new Vector3();
                    p2.setComponent(uAxis, u1 * halfSize);
                    p2.setComponent(vAxis, v2 * halfSize);
                    p2.setComponent(3 - uAxis - vAxis, sign * halfSize);
                    p2.normalize();

                    const p3 = new Vector3();
                    p3.setComponent(uAxis, u2 * halfSize);
                    p3.setComponent(vAxis, v2 * halfSize);
                    p3.setComponent(3 - uAxis - vAxis, sign * halfSize);
                    p3.normalize();

                    const p4 = new Vector3();
                    p4.setComponent(uAxis, u2 * halfSize);
                    p4.setComponent(vAxis, v1 * halfSize);
                    p4.setComponent(3 - uAxis - vAxis, sign * halfSize);
                    p4.normalize();

                    const a = vertexMap.get(getIndex(p1.x, p1.y, p1.z));
                    const b = vertexMap.get(getIndex(p2.x, p2.y, p2.z));
                    const c = vertexMap.get(getIndex(p3.x, p3.y, p3.z));
                    const d = vertexMap.get(getIndex(p4.x, p4.y, p4.z));

                    if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
                        indices.push(a, b, d, b, c, d);
                    }
                }
            }
        }

        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uv, 2));
        this.setIndex(new Uint16BufferAttribute(indices, 1));
        this.computeVertexNormals();
    }

    applyFractalNoise(params: FractalParams) {
        const position = this.attributes.position;
        const normal = this.attributes.normal;

        const positionVector = new Vector3();
        const normalVector = new Vector3();

        for (let i = 0; i < position.count; i++) {
            positionVector.fromBufferAttribute(position, i);
            normalVector.fromBufferAttribute(normal, i);

            // Compute Fractal Brownian Motion (FBM) noise
            let amplitude = params.amplitude;
            let frequency = params.frequency;
            let noiseValue = 0;

            for (let o = 0; o < params.octaves; o++) {
                noiseValue += PerlinNoise.noise3D(
                    positionVector.x * frequency,
                    positionVector.y * frequency,
                    positionVector.z * frequency
                ) * amplitude;

                frequency *= params.lacunarity;
                amplitude *= params.persistence;
            }

            // Adjust the vertex position based on noise (displace along normal)
            positionVector.addScaledVector(normalVector, noiseValue);

            position.setXYZ(i, positionVector.x, positionVector.y, positionVector.z);
        }

        position.needsUpdate = true;
        this.computeVertexNormals();
    }
}
