import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { FractalParams } from '../utils/perlin-noise';
import { PerlinNoise } from '../utils/perlin-noise';



export class SphericalBoxGeometry extends BufferGeometry {
    public minColor: number = 0.01;

    constructor(
        public readonly size: number,
        public readonly segments: number,
    ) {
        super();



        // this.createCubeGeometry();

        // const vertices = this.attributes.position;
        // let vertex = new Vector3();

        // for (let i = 0; i < vertices.count; i++) {
        //     vertex.fromBufferAttribute(vertices, i);
        //     vertex.normalize();
        //     vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
        // }

        // vertices.needsUpdate = true;
        // this.computeVertexNormals();
    }

    createCubeBufferGeometry() {
        const { size, segments } = this;
        
        const positions: number[] = [];

        // Calculate the vertices for each face
        for (let front = -segments; front <= segments; front++) {
            for (let top = -segments; top <= segments; top++) {
                const x = size * front;
                const y = size * top;
                const z = -size / 2;

                positions.push(x, y, z);
            }
        }

        // Top face
        for (let front = -segments; front <= segments; front++) {
            for (let left = -segments; left <= segments; left++) {
                const x = size * front;
                const y = size / 2;
                const z = size * left;

                positions.push(x, y, z);
            }
        }

        // Bottom face
        for (let front = -segments; front <= segments; front++) {
            for (let left = -segments; left <= segments; left++) {
                const x = size * front;
                const y = -size / 2;
                const z = size * left;

                positions.push(x, y, z);
            }
        }

        // Front face
        for (let top = -segments; top <= segments; top++) {
            for (let left = -segments; left <= segments; left++) {
                const x = -size / 2;
                const y = size * top;
                const z = size * left;

                positions.push(x, y, z);
            }
        }

        // Back face
        for (let top = -segments; top <= segments; top++) {
            for (let left = -segments; left <= segments; left++) {
                const x = size / 2;
                const y = size * top;
                const z = size * left;

                positions.push(x, y, z);
            }
        }

        // Left face
        for (let front = -segments; front <= segments; front++) {
            for (let top = -segments; top <= segments; top++) {
                const x = size * front;
                const y = size / 2;
                const z = -size / 2;

                positions.push(x, y, z);
            }
        }

        // Right face
        for (let front = -segments; front <= segments; front++) {
            for (let top = -segments; top <= segments; top++) {
                const x = -size / 2;
                const y = size * top;
                const z = -size / 2;

                positions.push(x, y, z);
            }
        }

        // Define topology
        const indices: number[] = [];

        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j < segments; j++) {
                indices.push(0 + 2 * i + j);
                indices.push(1 + 2 * i + j);
                indices.push(2 + 2 * i + j);

                if (j !== segments - 1) {
                    indices.push(3 + 2 * i + j);
                }
            }
        }

        this.setAttribute('position', new Float32BufferAttribute(indices, indices.length));
        this.setIndex(indices);

        // this.attributes.position.needsUpdate = true;
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

                frequency *= params.lacunarity; // Increase frequency by lacunarity
                amplitude *= params.persistence; // Decrease amplitude
            }

            // Adjust the vertex position based on noise
            normalVector.normalize().multiplyScalar(1 + 0); // Scale outward/inward
            position.setXYZ(i, normalVector.x, normalVector.y, normalVector.z);
        }

        position.needsUpdate = true;
        this.computeVertexNormals();
    }
}
