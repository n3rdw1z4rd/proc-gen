import { Group, Material, Mesh, MeshLambertMaterial, PlaneGeometry, Vector3 } from 'three';
import { SimplexNoise } from '../utils/simplex-noise';
import { log } from '../utils/logger';

export interface WorldParams {
    chunkSize?: number;
    chunkResolution?: number;
    viewDistance?: number;
    material?: Material;
    octaves?: number;
    frequency?: number;
    persistence?: number;
    amplitude?: number;
}

export class World extends Group {
    chunkSize: number;
    chunkResolution: number;

    viewDistance: number;

    material: Material;

    octaves: number;
    frequency: number;
    persistence: number;
    amplitude: number;

    chunks = new Map<string, Mesh>();
    noise = new SimplexNoise();

    constructor(params?: WorldParams) {
        super();

        this.chunkSize = params?.chunkSize ?? 256;
        this.chunkResolution = params?.chunkSize ?? Math.floor(this.chunkSize / 2);
        this.viewDistance = params?.viewDistance ?? Math.floor(this.chunkSize / 4);

        this.octaves = params?.octaves ?? 4;
        this.frequency = params?.frequency ?? 0.5;
        this.persistence = params?.persistence ?? 0.5;
        this.amplitude = params?.amplitude ?? 1.0;

        this.material = params?.material ?? new MeshLambertMaterial({
            color: 0x00ff00,
            wireframe: true,
        });
    }

    private _createChunkGeometry(x: number, z: number): PlaneGeometry {
        log('_createChunkGeometry:', x, z);

        const geometry = new PlaneGeometry(
            this.chunkSize,
            this.chunkSize,
            this.chunkResolution,
            this.chunkResolution,
        );

        geometry.rotateX(Math.PI * -0.5);

        if (this.chunkResolution > 1) {
            const vertices = geometry.getAttribute('position');

            if (vertices) {
                for (let c = 0; c < vertices.count; c++) {
                    const xi = c * 3;
                    const yi = xi + 1
                    const zi = yi + 1;

                    vertices.array[yi] = this.noise.fractalNoise2d(
                        vertices.array[xi] + x,
                        vertices.array[zi] + z,
                        this.octaves,
                        this.frequency,
                        this.persistence,
                        this.amplitude,
                    );
                }

                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
            }
        }

        return geometry;
    }

    private _generateChunksForPosition(position: Vector3) {
        for (let pdx = position.x - this.viewDistance; pdx <= position.x + this.viewDistance; pdx++) {
            for (let pdz = position.z - this.viewDistance; pdz <= position.z + this.viewDistance; pdz++) {
                const cx = Math.floor(pdx / this.chunkSize);
                const cz = Math.floor(pdz / this.chunkSize);

                if (!this.chunks.get(`${cx},${cz}`)) {
                    const chunk = new Mesh(
                        this._createChunkGeometry(cx, cz),
                        this.material,
                    );

                    chunk.position.set(cx, 0, cz);
                    chunk.position.multiplyScalar(this.chunkSize);

                    chunk.position.x += (this.chunkSize / 2);
                    chunk.position.z += (this.chunkSize / 2);

                    this.add(chunk);

                    this.chunks.set(`${cx},${cz}`, chunk);
                }
            }
        }
    }

    update(_deltaTime: number, viewPosition: Vector3) {
        this._generateChunksForPosition(viewPosition);
    }
}