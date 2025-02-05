import { BufferAttribute, BufferGeometry } from 'three';
import { TextureAtlas } from '../utils/threejs-boiler-plate';
import { log } from '../utils/logger';
import { FACES } from './face-map';

export interface ChunkGeometryParams {
    fill?: number,
}

export class ChunkGeometry extends BufferGeometry {
    private _voxels: Uint8Array;

    constructor(
        public readonly size: number,
        public textureAtlas: TextureAtlas,
        params?: ChunkGeometryParams,
    ) {
        super();

        this._voxels = new Uint8Array(size * size * size);
        this._voxels.fill(params?.fill ?? 0);

        this._generateGeometry();
    }

    private _calculateVoxelIndex(position: [number, number, number]): number {
        const [x, y, z] = position;
        return y * (this.size * this.size) + z * this.size + x;
    }

    public get(position: [number, number, number]): number {
        const i = this._calculateVoxelIndex(position);

        return (i >= 0 && i < this._voxels.length) ? this._voxels[i] : 0;
    }

    public set(position: [number, number, number], value: number) {
        const i = this._calculateVoxelIndex(position);

        log('set:', position, value, i);

        if (i >= 0 && i < this._voxels.length) {
            this._voxels[i] = value;
        }
    }

    private _generateGeometry() {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

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
                                    const [ux, uy] = this.textureAtlas.get(voxel, _ux, _uy);

                                    positions.push(x + px, y + py, z + pz);
                                    normals.push(nx, ny, nz);
                                    uvs.push(ux, uy);
                                });

                                indices.push(
                                    positionIndex, positionIndex + 1, positionIndex + 2,
                                    positionIndex + 2, positionIndex + 1, positionIndex + 3,
                                );
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
    }
}
