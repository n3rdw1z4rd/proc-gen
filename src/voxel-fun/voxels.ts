import { BufferAttribute, BufferGeometry, MathUtils } from 'three';
import { TextureAtlas } from '../utils/threejs-boiler-plate';
import { FACES } from '../voxel-engine/constants';
import { log } from '../utils/logger';
import { rng } from '../utils/rng';

export type Voxel = number;

export class VoxelBuffer {
    private _voxels: Uint8Array;

    constructor(public readonly size: number, fill: Voxel = 1) {
        this._voxels = new Uint8Array(this.size * this.size * this.size);
        this._voxels.fill(fill);
    }

    private _vin(x: number, y: number, z: number) {
        // x = MathUtils.euclideanModulo(x, this.size) | 0;
        // y = MathUtils.euclideanModulo(y, this.size) | 0;
        // z = MathUtils.euclideanModulo(z, this.size) | 0;

        return (y * this.size * this.size) + (z * this.size) + x;
    }

    public getVoxel(x: number, y: number, z: number): Voxel {
        const bi = this._vin(x, y, z);

        return (bi >= 0 && bi < this._voxels.length) ? this._voxels[bi] : 0;
    }

    public setVoxel(x: number, y: number, z: number, v: Voxel) {
        const bi = this._vin(x, y, z);

        if (bi >= 0 && bi < this._voxels.length) {
            this._voxels[bi] = v;
        }
    }
}

export class ChunkGeometry extends BufferGeometry {
    private _voxels: VoxelBuffer;
    private _textureAtlas: TextureAtlas;

    public get size(): number { return this._voxels.size; }

    constructor(
        size: number,
        textureAtlas: TextureAtlas,
    ) {
        super();

        this._textureAtlas = textureAtlas;
        this._voxels = new VoxelBuffer(size);

        this._generateChunkGeometry();
    }

    public getVoxel(x: number, y: number, z: number): Voxel {
        return this._voxels.getVoxel(x, y, z);
    }

    public setVoxel(x: number, y: number, z: number, v: Voxel) {
        this._voxels.setVoxel(x, y, z, v);
        this._generateChunkGeometry();
    }

    private _generateChunkGeometry() {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        const [cx, cy, cz] = [0, 0, 0];//chunk.position;

        for (let y = 0; y < this.size; ++y) {
            for (let z = 0; z < this.size; ++z) {
                for (let x = 0; x < this.size; ++x) {
                    const voxelPos: VEC3 = [cx + x, cy + y, cz + z];
                    const voxel = this._voxels.getVoxel(...voxelPos);
                    log('voxel:', voxel, voxelPos);

                    if (voxel) {
                        const uvVoxel = voxel - 1;

                        for (const { dir, corners, uvRow } of FACES) {
                            const neighborPos: VEC3 = [voxelPos[0] + dir[0], voxelPos[1] + dir[1], voxelPos[2] + dir[2]];
                            let neighborVoxel = this._voxels.getVoxel(...neighborPos);

                            log('neighborVoxel:', neighborVoxel, neighborPos);

                            if (!neighborVoxel) {
                                const ndx = positions.length / 3;

                                for (const { pos, uv } of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);

                                    normals.push(...dir);

                                    uvs.push(
                                        (uvVoxel + uv[0]) * this._textureAtlas.size / this._textureAtlas.textureData.width,
                                        1 - (uvRow + 1 - uv[1]) * this._textureAtlas.size / this._textureAtlas.textureData.height,
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

        this.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(positions), positionNumComponents)
        );

        this.setAttribute(
            'normal',
            new BufferAttribute(new Float32Array(normals), normalNumComponents)
        );

        this.setAttribute(
            'uv',
            new BufferAttribute(new Float32Array(uvs), uvNumComponents)
        );

        this.setIndex(indices);
    }
}
