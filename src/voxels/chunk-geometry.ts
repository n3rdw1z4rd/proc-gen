import { BufferAttribute, BufferGeometry } from 'three';
import { TextureAtlas } from '../utils/threejs-boiler-plate';
import { FACES } from './faces';

export class ChunkGeometry extends BufferGeometry {
    private _voxels: Uint8Array;

    constructor(
        public textureAtlas: TextureAtlas,
        public readonly size: number = 16,
    ) {
        super();

        this._voxels = new Uint8Array(size * size * size);
        this._voxels.fill(0);
        this._generateGeometry();
    }

    private _calculateVoxelIndex(position: VEC3): number {
        const [x, y, z] = position;

        let index = -1;

        if (
            x >= 0 && x < this.size &&
            y >= 0 && y < this.size &&
            z >= 0 && z < this.size
        ) {
            index = y * this.size * this.size + z * this.size + x;
        }

        return index;
    }

    public get(position: VEC3): number {
        let voxel = 0;

        const index = this._calculateVoxelIndex(position);

        if (index >= 0) voxel = this._voxels[index];

        return voxel;
    }

    public set(position: VEC3, value: number) {
        const i = this._calculateVoxelIndex(position);

        if (i >= 0 && i < this._voxels.length) {
            this._voxels[i] = value;
        }
    }

    private _generateGeometry() {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        let needsUpdate: boolean = false;

        for (let y = 0; y < this.size; ++y) {
            for (let z = 0; z < this.size; ++z) {
                for (let x = 0; x < this.size; ++x) {
                    const voxel = this.get([x, y, z]);

                    if (voxel) {
                        FACES.forEach((faces: Array<number[]>) => {
                            const [dx, dy, dz] = faces[0];
                            const neighborVoxel = this.get([x + dx, y + dy, z + dz]);

                            if (!neighborVoxel) {
                                const positionIndex = positions.length / 3;

                                faces.forEach((faceVerts: number[]) => {
                                    const [nx, ny, nz, px, py, pz, _ux, _uy] = faceVerts;
                                    const [ux, uy] = this.textureAtlas.get(voxel - 1, _ux, _uy);

                                    positions.push(x + px, y + py, z + pz);
                                    normals.push(nx, ny, nz);
                                    uvs.push(ux, uy);
                                });

                                indices.push(
                                    positionIndex, positionIndex + 1, positionIndex + 2,
                                    positionIndex + 2, positionIndex + 1, positionIndex + 3,
                                );

                                needsUpdate = true;
                            }
                        });

                        this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
                        this.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
                        this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));

                        this.setIndex(indices);
                    }
                }
            }
        }

        if (needsUpdate) {
            this.attributes.position.needsUpdate = true;
            this.computeVertexNormals();
        }
    }

    public updateGeometry() {
        this._generateGeometry();
    }

    public forEachVoxel(callback: (this: ChunkGeometry, position: VEC3) => void) {
        for (let y = 0; y < this.size; ++y) {
            for (let z = 0; z < this.size; ++z) {
                for (let x = 0; x < this.size; ++x) {
                    callback.bind(this)([x, y, z]);
                }
            }
        }
    }
}
