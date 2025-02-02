import { BufferAttribute, Material, MathUtils, Mesh } from 'three';
import { rng } from '../utils/rng';
import { FACES } from '../voxel-engine/constants';
import { TextureData } from '../utils/threejs-boiler-plate';

export interface VoxelChunkParams {
    size: number,
    textureData: TextureData,
    textureSize: number,
    material: Material,
}

export class VoxelChunk extends Mesh {
    private _size: number;
    private _textureData: TextureData;
    private _textureSize: number;

    private _voxels: Uint8Array;

    private _needsGeometryUpdate: boolean = false;

    constructor(params: VoxelChunkParams) {
        super();

        this._size = params.size;
        this._textureData = params.textureData;
        this._textureSize = params.textureSize;
        this.material = params.material;

        this._voxels = new Uint8Array(this._size * this._size * this._size);
    }

    private _calculateVoxelIndex(x: number, y: number, z: number): number {
        x = MathUtils.euclideanModulo(x, this._size) | 0;
        y = MathUtils.euclideanModulo(y, this._size) | 0;
        z = MathUtils.euclideanModulo(z, this._size) | 0;

        return y * (this._size * this._size) + z * this._size + x;
    }

    public getVoxel(x: number, y: number, z: number): number {
        const voxelIndex = this._calculateVoxelIndex(x, y, z);

        return (voxelIndex >= 0 && voxelIndex < this._voxels.length)
            ? this._voxels[voxelIndex]
            : 0;
    }

    public setVoxel(x: number, y: number, z: number, voxel: number) {
        const voxelIndex = this._calculateVoxelIndex(x, y, z);

        if (voxelIndex >= 0 && voxelIndex < this._voxels.length) {
            this._voxels[voxelIndex] = voxel;
            this._needsGeometryUpdate = true;
        }
    }

    public generateVoxels(voxel?: number) {
        this._voxels = this._voxels.map(() => voxel ?? rng.range(1, 17));
        this._needsGeometryUpdate = true;
    }

    private _generateChunkGeometry() {
        if (this._needsGeometryUpdate) {
            const positions = [];
            const normals = [];
            const uvs = [];
            const indices = [];

            for (let y = 0; y < this._size; ++y) {
                for (let z = 0; z < this._size; ++z) {
                    for (let x = 0; x < this._size; ++x) {
                        // const voxelPos: VEC3 = [x, y, z];
                        // const voxel = this._getVoxelInChunk(voxelPos);

                        const voxel = this.getVoxel(x, y, z);

                        // log('voxel:', voxel, voxelPos);

                        if (voxel) {
                            const uvVoxel = voxel - 1;

                            for (const { dir, corners, uvRow } of FACES) {
                                const [nx, ny, nz] = [x + dir[0], y + dir[1], z + dir[2]];
                                // const neighborVoxel = this._getVoxelInChunk(neighborPos);
                                const neighborVoxel = this.getVoxel(nx, ny, nz);

                                // log('neighborVoxel:', neighborVoxel, neighborPos);

                                if (!neighborVoxel) {
                                    const ndx = positions.length / 3;

                                    for (const { pos, uv } of corners) {
                                        positions.push(
                                            pos[0] + x,
                                            pos[1] + y,
                                            pos[2] + z
                                        );

                                        normals.push(...dir);

                                        uvs.push(
                                            (uvVoxel + uv[0]) * this._textureSize / this._textureData.width,
                                            1 - (uvRow + 1 - uv[1]) * this._textureSize / this._textureData.height,
                                        );
                                    }

                                    indices.push(
                                        ndx, ndx + 1, ndx + 2,
                                        ndx + 2, ndx + 1, ndx + 3,
                                    );
                                }
                            }
                        }
                    }
                }
            }

            const positionNumComponents = 3;
            const normalNumComponents = 3;
            const uvNumComponents = 2;

            this.geometry.setAttribute(
                'position',
                new BufferAttribute(new Float32Array(positions), positionNumComponents),
            );

            this.geometry.setAttribute(
                'normal',
                new BufferAttribute(new Float32Array(normals), normalNumComponents),
            );

            this.geometry.setAttribute(
                'uv',
                new BufferAttribute(new Float32Array(uvs), uvNumComponents),
            );

            this.geometry.setIndex(indices);

            this._needsGeometryUpdate = false;
        }
    }

    public update() {
        this._generateChunkGeometry();
    }
}