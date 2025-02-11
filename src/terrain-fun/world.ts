import { Group, Material, Vector3 } from 'three';
import { TerrainMesh } from './terrain-mesh';
import { log } from '../utils/logger';
import { noise, NoiseParams } from '../utils/noise';

export class World extends Group {
    public readonly chunkSize: number;
    public readonly chunkResolution: number;

    public material: Material;
    public viewDistance: number;
    public noiseParams: NoiseParams;

    public generateStepAmount: number;

    // private _viewDistanceMesh: Mesh;
    private _chunks = new Map<string, TerrainMesh>();

    constructor(
        chunkSize: number,
        chunkResolution: number,
        material: Material,
        noiseParams?: NoiseParams,
    ) {
        super();

        this.chunkSize = Math.abs(Math.floor(chunkSize));
        this.chunkResolution = Math.abs(Math.floor(chunkResolution));

        this.material = material;

        this.noiseParams = noiseParams ?? {
            octaves: 1,
            frequency: 0,
            persistence: 0,
            amplitude: 0,
        }

        this.generateStepAmount = Math.floor(this.chunkSize / 4); // TODO: why do we need this?

        this.viewDistance = Math.floor(this.chunkSize * 2);

        // this._viewDistanceMesh = new Mesh(
        //     new CircleGeometry(this.viewDistance, 12, 0, Math.PI * 2),
        //     new MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 }),
        // );

        // this._viewDistanceMesh.rotateX(Math.PI * -0.5);
        // this.add(this._viewDistanceMesh);

        this._generateChunksForPosition();
    }

    // private _createChunkGeometry(x: number, z: number): PlaneGeometry {
    //     const geometry = new PlaneGeometry(
    //         this.chunkSize,
    //         this.chunkSize,
    //         this.chunkResolution,
    //         this.chunkResolution,
    //     );

    //     geometry.rotateX(Math.PI * -0.5);

    //     if (this.chunkResolution > 1) {
    //         const vertices = geometry.getAttribute('position');

    //         if (vertices) {
    //             for (let c = 0; c < vertices.count; c++) {
    //                 const xi = c * 3;
    //                 const yi = xi + 1
    //                 const zi = yi + 1;

    //                 vertices.array[yi] = noise(
    //                     vertices.array[xi] + x,
    //                     vertices.array[zi] + z, {
    //                     octaves: this._noise.octaves,
    //                     frequency: this._noise.frequency,
    //                     persistence: this._noise.persistence,
    //                     amplitude: this._noise.amplitude,
    //                 });
    //             }

    //             geometry.attributes.position.needsUpdate = true;
    //             geometry.computeVertexNormals();
    //         }
    //     }

    //     return geometry;
    // }

    private _generateChunksForPosition(position?: Vector3) {
        position = position ?? new Vector3();

        const distance = this.viewDistance;

        for (let px = position.x - distance; px < position.x + distance; px += this.generateStepAmount) {
            for (let pz = position.z - distance; pz < position.z + distance; pz += this.generateStepAmount) {
                const testPoint = new Vector3(px, 0, pz).floor();
                const distance = testPoint.distanceTo(position);

                if (distance < this.viewDistance) {
                    const cx = Math.floor(px / this.chunkSize);
                    const cz = Math.floor(pz / this.chunkSize);
                    const chunkName = `${cx},${cz}`;

                    if (!this._chunks.get(chunkName)) {
                        const chunk = new TerrainMesh(
                            this.chunkSize,
                            this.chunkResolution,
                            this.material,
                        );

                        chunk.name = chunkName;

                        chunk.position.set(
                            (cx * this.chunkSize) + (this.chunkSize / 2),
                            0,
                            (cz * this.chunkSize) + (this.chunkSize / 2)
                        );

                        chunk.createGeometry((x: number, _y: number, z: number) =>
                            noise(x + chunk.position.x, z + chunk.position.z, this.noiseParams)
                        );

                        this.add(chunk);
                        this._chunks.set(chunkName, chunk);
                    }
                }
            }
        }
    }

    public updateNoise(noiseParams: NoiseParams) {
        this.noiseParams = noiseParams;

        this._chunks.forEach((chunk: TerrainMesh, pos: string) => {
            log('updating chunk:', pos);

            chunk.forEachVertex((x: number, _y: number, z: number) => noise(
                chunk.position.x + x,
                chunk.position.z + z,
                this.noiseParams,
            ));
        });
    }

    public update(_deltaTime: number, viewPosition: Vector3 = this.position) {
        // this._viewDistanceMesh.position.set(...viewPosition.toArray());
        this._generateChunksForPosition(viewPosition);
    }
}
