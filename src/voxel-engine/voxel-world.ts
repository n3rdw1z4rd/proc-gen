import { BufferAttribute, BufferGeometry, Group, Material, MathUtils, Mesh, MeshPhongMaterial, NearestFilter, Texture, TextureLoader, Vector3 } from 'three';
import { logwrn } from '../utils/logger';
import { rng } from '../utils/rng';

export type POS = [number, number, number];
export type ChunkData = Uint8Array;

export interface Chunk {
    position: POS,
    data: ChunkData,
    geometry: BufferGeometry,
    mesh: Mesh | null,
}

export class World extends Group {
    private _chunkSize: number = 16;

    private _voxelTextureSize: number = 16;

    private _textureWidth: number = 0;
    private _textureHeight: number = 0;
    private _material: Material | undefined;

    private _chunks: Map<string, Chunk> = new Map<string, Chunk>();

    constructor(textureUrl?: string) {
        super();

        if (textureUrl) this.loadTexture(textureUrl);
    }

    public loadTexture(url: string) {
        (new TextureLoader()).load(url, (texture: Texture) => {
            texture.magFilter = NearestFilter;

            this._textureWidth = texture.source.data.width;
            this._textureHeight = texture.source.data.height;

            this._material = new MeshPhongMaterial({
                map: texture,
                alphaTest: 0.1,
                transparent: true,
            });
        });
    }

    public update(_deltaTime: number, position: POS | Vector3 = [0, 0, 0]) {
        if (position instanceof Vector3) position = position.toArray();

        if (!this._getChunk(position)) {
            this._generateChunk(position);
        }
    }

    private _computeChunkKey(position: POS): string {
        return (position.map((value: number) => Math.floor(value / this._chunkSize)) as POS).join('x');
    }

    private _getChunk(position: POS): Chunk | null {
        const key = this._computeChunkKey(position);
        return this._chunks.get(key) ?? null;
    }

    private _computeChunkIndex(position: POS) {
        let [x, y, z] = position;

        x = MathUtils.euclideanModulo(x, this._chunkSize) | 0;
        y = MathUtils.euclideanModulo(y, this._chunkSize) | 0;
        z = MathUtils.euclideanModulo(z, this._chunkSize) | 0;

        return y * (this._chunkSize * this._chunkSize) + z * this._chunkSize + x;
    }

    public setVoxel(position: POS, value: number) {
        const chunk = this._getChunk(position);

        if (chunk) {
            const i = this._computeChunkIndex(position);

            if (i >= 0 && i < chunk.data.length) {
                chunk.data[i] = value;
            }
        }
    }

    public getVoxel(position: POS): number {
        let value: number = 0;

        const chunk = this._getChunk(position);

        if (chunk) {
            const i = this._computeChunkIndex(position);

            if (i >= 0 && i < chunk.data.length) {
                value = chunk.data[i];
            }
        } else logwrn('getVoxel: missing chunk at:', position);

        return value;
    }

    private _generateChunkTerrain(chunk: Chunk) {
        for (let y = 0; y < this._chunkSize; ++y) {
            for (let z = 0; z < this._chunkSize; ++z) {
                for (let x = 0; x < this._chunkSize; ++x) {
                    const height = (Math.sin(x / this._chunkSize * Math.PI * 2) + Math.sin(z / this._chunkSize * Math.PI * 3)) * (this._chunkSize / 6) + (this._chunkSize / 2);

                    if (y < height) {
                        const i = this._computeChunkIndex([x, y, z]);

                        if (i >= 0 && i < chunk.data.length) {
                            chunk.data[i] = rng.range(1, 17);
                        }
                    }
                }
            }
        }
    }

    private _generateChunkGeometry(chunk: Chunk) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        const [cx, cy, cz] = chunk.position;

        for (let y = 0; y < this._chunkSize; ++y) {
            for (let z = 0; z < this._chunkSize; ++z) {
                for (let x = 0; x < this._chunkSize; ++x) {
                    const voxelPos: POS = [cx + x, cy + y, cz + z];

                    const voxel = this.getVoxel(voxelPos);

                    if (voxel) {
                        const uvVoxel = voxel - 1;

                        for (const { dir, corners, uvRow } of FACES) {
                            const neighborPos: POS = [voxelPos[0] + dir[0], voxelPos[1] + dir[1], voxelPos[2] + dir[2]];

                            let neighbor = this.getVoxel(neighborPos);

                            if (!neighbor) {
                                const ndx = positions.length / 3;

                                for (const { pos, uv } of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);

                                    normals.push(...dir);
                                    uvs.push(
                                        (uvVoxel + uv[0]) * this._voxelTextureSize / this._textureWidth,
                                        1 - (uvRow + 1 - uv[1]) * this._voxelTextureSize / this._textureHeight,
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

        chunk.geometry.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(positions), positionNumComponents)
        );

        chunk.geometry.setAttribute(
            'normal',
            new BufferAttribute(new Float32Array(normals), normalNumComponents)
        );

        chunk.geometry.setAttribute(
            'uv',
            new BufferAttribute(new Float32Array(uvs), uvNumComponents)
        );

        chunk.geometry.setIndex(indices);
    }

    private _generateChunk(position: POS) {
        if (this._material) {
            const chunk: Chunk = {
                position: position.map((value: number) => Math.floor(value / this._chunkSize)) as POS,
                data: new Uint8Array(this._chunkSize * this._chunkSize * this._chunkSize),
                geometry: new BufferGeometry(),
                mesh: null,
            };

            this._chunks.set(chunk.position.join('x'), chunk);

            this._generateChunkTerrain(chunk);
            this._generateChunkGeometry(chunk);

            chunk.mesh = new Mesh(chunk.geometry, this._material);
            chunk.mesh.position.x -= (this._chunkSize / 2);
            chunk.mesh.position.z -= (this._chunkSize / 2);

            this.add(chunk.mesh);
        }
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
