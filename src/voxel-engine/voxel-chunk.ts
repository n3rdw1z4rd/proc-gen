import { BufferAttribute, BufferGeometry, Material, MathUtils, Mesh } from 'three';
import { rng } from '../utils/rng';

export interface VoxelChunkParams {
    chunkSize: number,
    tileSize: number,
    tileTextureWidth: number,
    tileTextureHeight: number,
}

export class VoxelChunk {
    private _size: number;

    private _textureWidth: number;
    private _textureHeight: number;
    private _textureSize: number;

    private _chunk: Uint8Array;

    private _geometry: BufferGeometry | undefined;

    constructor(options: VoxelChunkParams) {
        this._size = options.chunkSize;

        this._textureSize = options.tileSize; // TODO: what is this used for?

        this._textureWidth = options.tileTextureWidth;
        this._textureHeight = options.tileTextureHeight;

        this._chunk = new Uint8Array(this._size * this._size * this._size);
    }

    private _getChunk(x: number, y: number, z: number): Uint8Array | null {
        const cellX = Math.floor(x / this._size);
        const cellY = Math.floor(y / this._size);
        const cellZ = Math.floor(z / this._size);

        return (cellX !== 0 || cellY !== 0 || cellZ !== 0) ? null : this._chunk;
    }

    private _computeChunkIndex(x: number, y: number, z: number) {
        x = MathUtils.euclideanModulo(x, this._size) | 0;
        y = MathUtils.euclideanModulo(y, this._size) | 0;
        z = MathUtils.euclideanModulo(z, this._size) | 0;

        return y * (this._size * this._size) + z * this._size + x;
    }

    public setVoxel(x: number, y: number, z: number, v: number) {
        const i = this._computeChunkIndex(x, y, z);

        if (i >= 0 && i < this._chunk.length) {
            this._chunk[i] = v;
        }
    }

    public getVoxel(x: number, y: number, z: number): number {
        return this._getChunk(x, y, z)
            ? this._chunk[this._computeChunkIndex(x, y, z)]
            : 0;
    }

    generateRandomVoxels() {
        for (let y = 0; y < this._size; ++y) {
            for (let z = 0; z < this._size; ++z) {
                for (let x = 0; x < this._size; ++x) {
                    const height = (Math.sin(x / this._size * Math.PI * 2) + Math.sin(z / this._size * Math.PI * 3)) * (this._size / 6) + (this._size / 2);

                    if (y < height) {
                        this.setVoxel(
                            x, y, z,
                            // 7,
                            rng.range(1, 17),
                        );
                    }
                }
            }
        }
    }

    generateGeometry() {
        if (!this._geometry) {
            this._geometry = new BufferGeometry();

            const positions = [];
            const normals = [];
            const uvs = [];
            const indices = [];

            for (let y = 0; y < this._size; ++y) {
                for (let z = 0; z < this._size; ++z) {
                    for (let x = 0; x < this._size; ++x) {
                        const voxel = this.getVoxel(x, y, z);

                        if (voxel) {
                            const uvVoxel = voxel - 1;

                            for (const { dir, corners, uvRow } of FACES) {
                                const neighbor = this.getVoxel(
                                    x + dir[0],
                                    y + dir[1],
                                    z + dir[2]
                                );

                                if (!neighbor) {
                                    const ndx = positions.length / 3;

                                    for (const { pos, uv } of corners) {
                                        positions.push(pos[0] + x, pos[1] + y, pos[2] + z);

                                        normals.push(...dir);
                                        uvs.push(
                                            (uvVoxel + uv[0]) * this._textureSize / this._textureWidth,
                                            1 - (uvRow + 1 - uv[1]) * this._textureSize / this._textureHeight,
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

            this._geometry.setAttribute(
                'position',
                new BufferAttribute(new Float32Array(positions), positionNumComponents)
            );

            this._geometry.setAttribute(
                'normal',
                new BufferAttribute(new Float32Array(normals), normalNumComponents)
            );

            this._geometry.setAttribute(
                'uv',
                new BufferAttribute(new Float32Array(uvs), uvNumComponents)
            );

            this._geometry.setIndex(indices);
        }
    }

    generateMesh(material: Material): Mesh {
        this.generateGeometry();

        return new Mesh(this._geometry, material);
    }
}

const FACES = [
    { // left
        uvRow: 0,
        dir: [-1, 0, 0,],
        corners: [
            { pos: [0, 1, 0], uv: [0, 1], },
            { pos: [0, 0, 0], uv: [0, 0], },
            { pos: [0, 1, 1], uv: [1, 1], },
            { pos: [0, 0, 1], uv: [1, 0], },
        ],
    },
    { // right
        uvRow: 0,
        dir: [1, 0, 0,],
        corners: [
            { pos: [1, 1, 1], uv: [0, 1], },
            { pos: [1, 0, 1], uv: [0, 0], },
            { pos: [1, 1, 0], uv: [1, 1], },
            { pos: [1, 0, 0], uv: [1, 0], },
        ],
    },
    { // bottom
        uvRow: 1,
        dir: [0, -1, 0,],
        corners: [
            { pos: [1, 0, 1], uv: [1, 0], },
            { pos: [0, 0, 1], uv: [0, 0], },
            { pos: [1, 0, 0], uv: [1, 1], },
            { pos: [0, 0, 0], uv: [0, 1], },
        ],
    },
    { // top
        uvRow: 2,
        dir: [0, 1, 0,],
        corners: [
            { pos: [0, 1, 1], uv: [1, 1], },
            { pos: [1, 1, 1], uv: [0, 1], },
            { pos: [0, 1, 0], uv: [1, 0], },
            { pos: [1, 1, 0], uv: [0, 0], },
        ],
    },
    { // back
        uvRow: 0,
        dir: [0, 0, -1,],
        corners: [
            { pos: [1, 0, 0], uv: [0, 0], },
            { pos: [0, 0, 0], uv: [1, 0], },
            { pos: [1, 1, 0], uv: [0, 1], },
            { pos: [0, 1, 0], uv: [1, 1], },
        ],
    },
    { // front
        uvRow: 0,
        dir: [0, 0, 1,],
        corners: [
            { pos: [0, 0, 1], uv: [0, 0], },
            { pos: [1, 0, 1], uv: [1, 0], },
            { pos: [0, 1, 1], uv: [0, 1], },
            { pos: [1, 1, 1], uv: [1, 1], },
        ],
    },
];
