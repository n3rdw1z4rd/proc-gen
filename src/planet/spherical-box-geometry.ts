import { BufferGeometry, Float32BufferAttribute, MeshLambertMaterial, Uint16BufferAttribute, Vector3 } from 'three';
import { FractalParams } from '../utils/perlin-noise';
import GUI from 'lil-gui';
import { PerlinNoise } from '../utils/perlin-noise';

export class SphericalBoxGeometry extends BufferGeometry {
    constructor(
        public readonly size: number,
        public readonly segments: number,
    ) {
        super();

        this._generateGeometry();
    }

    private _generateGeometry() {
        const halfSize = this.size / 2;
        const grid = this.segments + 1;
        const vertices = [];
        const indices = [];
        const normals = [];
        const uv = [];
        const vertexMap = new Map(); // Map to store unique vertex indices
        const vertexList = []; // Stores vertex positions in order

        const getIndex = (x: number, y: number, z: number) => `${x},${y},${z}`;

        // Generate vertices
        for (let i = 0; i < 6; i++) {
            const axisU = (i % 3) === 0 ? 1 : 0;
            const axisV = (i % 3) === 1 ? 1 : 2;
            const sign = (i < 3) ? 1 : -1;

            for (let y = 0; y < grid; y++) {
                for (let x = 0; x < grid; x++) {
                    const u = x / this.segments * 2 - 1;
                    const v = y / this.segments * 2 - 1;
                    const position = new Vector3();
                    position.setComponent(axisU, u * halfSize);
                    position.setComponent(axisV, v * halfSize);
                    position.setComponent(3 - axisU - axisV, sign * halfSize);

                    position.normalize().multiplyScalar(halfSize); // Normalize to sphere
                    const key = getIndex(position.x, position.y, position.z);
                    // log('key:', key);

                    if (!vertexMap.has(key)) {
                        vertexMap.set(key, vertexList.length);
                        vertexList.push(position);
                    }
                }
            }
        }

        // Convert stored vertices to flat array
        for (const pos of vertexList) {
            vertices.push(pos.x, pos.y, pos.z);
            normals.push(pos.x, pos.y, pos.z); // Normal = position for sphere
            uv.push(0.5 + Math.atan2(pos.z, pos.x) / (2 * Math.PI), 0.5 - Math.asin(pos.y / halfSize) / Math.PI);
        }

        // Generate indices
        for (let i = 0; i < 6; i++) {
            for (let y = 0; y < this.segments; y++) {
                for (let x = 0; x < this.segments; x++) {
                    const a = vertexMap.get(getIndex(x / this.segments * 2 - 1, y / this.segments * 2 - 1, i));
                    const b = vertexMap.get(getIndex(x / this.segments * 2 - 1, (y + 1) / this.segments * 2 - 1, i));
                    const c = vertexMap.get(getIndex((x + 1) / this.segments * 2 - 1, (y + 1) / this.segments * 2 - 1, i));
                    const d = vertexMap.get(getIndex((x + 1) / this.segments * 2 - 1, y / this.segments * 2 - 1, i));

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
                    positionVector.z * frequency,
                ) * amplitude;

                frequency *= params.lacunarity; // Increase frequency by lacunarity
                amplitude *= params.persistence; // Decrease amplitude
            }

            // Adjust the vertex position based on noise
            normalVector.multiplyScalar(1 + noiseValue); // Scale outward/inward
            position.setXYZ(i, normalVector.x, normalVector.y, normalVector.z);
        }

        position.needsUpdate = true;
        this.computeVertexNormals();
    }

    addFractalNoiseControls(fractalParams: FractalParams, material?: MeshLambertMaterial) {
        const gui = new GUI();

        gui.add(fractalParams, 'octaves', 1, 8, 1).onChange(() => this.applyFractalNoise(fractalParams));
        gui.add(fractalParams, 'frequency', 0.01, 1.0, 0.01).onChange(() => this.applyFractalNoise(fractalParams));
        gui.add(fractalParams, 'persistence', 0.1, 1.0, 0.1).onChange(() => this.applyFractalNoise(fractalParams));
        gui.add(fractalParams, 'amplitude', 0.1, 8, 0.1).onChange(() => this.applyFractalNoise(fractalParams));
        gui.add(fractalParams, 'lacunarity', 0.1, 8, 0.1).onChange(() => this.applyFractalNoise(fractalParams));

        if (material) {
            gui.add(material, 'wireframe');
        }

        this.applyFractalNoise(fractalParams);
    }
}
