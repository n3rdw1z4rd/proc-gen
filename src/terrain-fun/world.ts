import { CircleGeometry, Group, Material, Mesh, MeshLambertMaterial, PlaneGeometry, Vector3 } from 'three';
import { SimplexNoise } from '../utils/simplex-noise';

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
    private _chunkSize: number;
    private _chunkResolution: number;
    private _material: Material;

    public viewDistance: number;
    public generateStepAmount: number;
    private _viewDistanceMesh: Mesh;

    private _octaves: number;
    private _frequency: number;
    private _persistence: number;
    private _amplitude: number;

    private _chunks = new Map<string, Mesh>();
    private _noise = new SimplexNoise();

    constructor(params?: WorldParams) {
        super();

        this._chunkSize = params?.chunkSize ?? 100;
        this._chunkResolution = params?.chunkResolution ?? Math.floor(this._chunkSize / 2);
        this.generateStepAmount = Math.floor(this.chunkSize / 4);

        this.viewDistance = params?.viewDistance ?? Math.floor(this._chunkSize * 2);

        this._octaves = params?.octaves ?? 4;
        this._frequency = params?.frequency ?? 0.5;
        this._persistence = params?.persistence ?? 0.5;
        this._amplitude = params?.amplitude ?? 1.0;

        this._material = params?.material ?? new MeshLambertMaterial({
            color: 0x006600,
            wireframe: true,
        });

        this._viewDistanceMesh = new Mesh(
            new CircleGeometry(this.viewDistance, 12, 0, Math.PI * 2),
            new MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 }),
        );
        this._viewDistanceMesh.rotateX(Math.PI * -0.5);
        this.add(this._viewDistanceMesh);
    }

    private _createChunkGeometry(x: number, z: number): PlaneGeometry {
        const geometry = new PlaneGeometry(
            this._chunkSize,
            this._chunkSize,
            this._chunkResolution,
            this._chunkResolution,
        );

        geometry.rotateX(Math.PI * -0.5);

        if (this._chunkResolution > 1) {
            const vertices = geometry.getAttribute('position');

            if (vertices) {
                for (let c = 0; c < vertices.count; c++) {
                    const xi = c * 3;
                    const yi = xi + 1
                    const zi = yi + 1;

                    vertices.array[yi] = this._noise.fractalNoise2d(
                        vertices.array[xi] + x,
                        vertices.array[zi] + z,
                        this._octaves,
                        this._frequency,
                        this._persistence,
                        this._amplitude,
                    );
                }

                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
            }
        }

        return geometry;
    }

    private _generateChunksForPosition(position: Vector3) {

        const distance = this.viewDistance;

        for (let px = position.x - distance; px < position.x + distance; px += this.generateStepAmount) {
            for (let pz = position.z - distance; pz < position.z + distance; pz += this.generateStepAmount) {
                const testPoint = new Vector3(px, 0, pz).floor();
                const distance = testPoint.distanceTo(position);

                if (distance < this.viewDistance) {
                    const cx = Math.floor(px / this._chunkSize);
                    const cz = Math.floor(pz / this._chunkSize);
                    const chunkName = `${cx},${cz}`;

                    if (!this._chunks.get(chunkName)) {
                        const chunk = new Mesh(
                            this._createChunkGeometry(cx, cz),
                            this._material,
                        );

                        chunk.position.set(
                            (cx * this._chunkSize) + (this._chunkSize / 2),
                            0,
                            (cz * this._chunkSize) + (this._chunkSize / 2)
                        );

                        chunk.name = chunkName;

                        this.add(chunk);

                        this._chunks.set(chunkName, chunk);
                    }
                }
            }
        }
    }

    update(_deltaTime: number, viewPosition: Vector3) {
        this._viewDistanceMesh.position.set(...viewPosition.toArray());
        this._generateChunksForPosition(viewPosition);
    }

    public get chunkSize(): number {
        return this._chunkSize;
    }

    public get chunkResolution(): number {
        return this._chunkResolution;
    }

    public get octaves(): number {
        return this._octaves;
    }

    public get frequency(): number {
        return this._frequency;
    }

    public get persistence(): number {
        return this._persistence;
    }

    public get amplitude(): number {
        return this._amplitude;
    }

}