import { BufferAttribute, BufferGeometry, Group, Material, MathUtils, Mesh, MeshPhongMaterial, NearestFilter, Texture, TextureLoader, Vector3 } from 'three';
import { FACES } from './constants';
import { rng } from '../utils/rng';

const KEY_POS_DELIMITER = 'x';

export type POS = [number, number, number];
export type ChunkData = Uint8Array;

export interface Chunk {
    position: POS,
    data: ChunkData,
    geometry: BufferGeometry,
    mesh: Mesh | null,
}

export class World extends Group {
    private _chunkSize: number = 4;
    public get chunkSize(): number { return this._chunkSize; }

    // TODO: use a "view radius" to find how many chunks to render instead of _chunkRenderRange
    private _chunkRenderRange: number = 2;

    private _voxelTextureSize: number = 16;

    private _textureWidth: number = 0;
    private _textureHeight: number = 0;
    private _material: Material | undefined;

    private _chunks: Map<string, Chunk> = new Map<string, Chunk>();
    public get chunkCount(): number { return this._chunks.size; }

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

    private _getChunkKey(position: POS): string {
        return position.join(KEY_POS_DELIMITER);
    }

    private _createChunk(position: POS): Chunk {
        const chunk: Chunk = {
            position,
            data: new Uint8Array(this._chunkSize * this._chunkSize * this._chunkSize),
            geometry: new BufferGeometry(),
            mesh: null,
        };

        this._generateChunkTerrain(chunk);

        const chunkKey = position.join(KEY_POS_DELIMITER);
        this._chunks.set(chunkKey, chunk);

        return chunk;
    }

    private _getChunk(position: POS): Chunk | null {
        const key = this._getChunkKey(position);
        return this._chunks.get(key) ?? null;
    }

    private _computeChunkIndex(position: POS) {
        let [x, y, z] = position;

        x = MathUtils.euclideanModulo(x, this._chunkSize) | 0;
        y = MathUtils.euclideanModulo(y, this._chunkSize) | 0;
        z = MathUtils.euclideanModulo(z, this._chunkSize) | 0;

        return y * (this._chunkSize * this._chunkSize) + z * this._chunkSize + x;
    }

    // public setVoxel(position: POS, value: number) {
    //     const chunk = this._getChunk(position);

    //     if (chunk) {
    //         const i = this._computeChunkIndex(position);

    //         if (i >= 0 && i < chunk.data.length) {
    //             chunk.data[i] = value;
    //         }
    //     }
    // }

    public getVoxel(position: POS, chunk?: Chunk | null): number {
        let value: number = 0;

        if (!chunk) {
            // TODO: convert position
            // chunk = this._getChunk(position);
        }

        if (chunk) {
            const i = this._computeChunkIndex(position);

            if (i >= 0 && i < chunk.data.length) {
                value = chunk.data[i];
            }
        }

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

                    const voxel = this.getVoxel(voxelPos, chunk);

                    if (voxel) {
                        const uvVoxel = voxel - 1;

                        for (const { dir, corners, uvRow } of FACES) {
                            const neighborPos: POS = [voxelPos[0] + dir[0], voxelPos[1] + dir[1], voxelPos[2] + dir[2]];
                            const neighborChunk = this._getChunk(neighborPos);

                            const neighbor = this.getVoxel(neighborPos, neighborChunk);

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

    private _playerPositionToChunkPosition(playerPosition: Vector3 | POS): POS {
        playerPosition = (playerPosition instanceof Vector3) ? playerPosition.toArray() : playerPosition;

        return [
            (playerPosition[0] / this._chunkSize) | 0,
            (playerPosition[1] / this._chunkSize) | 0,
            (playerPosition[2] / this._chunkSize) | 0,
        ];
    }

    private _generateChunks(position: POS) {
        const offset = this._chunkRenderRange;
        const createdChunks = [];

        for (let x = -offset; x <= offset; x++) {
            for (let z = -offset; z <= offset; z++) {
                const pos: POS = [position[0] + x, position[1], position[2] + z];

                if (!this._getChunk(pos)) {
                    const chunk = this._createChunk(pos);
                    createdChunks.push(chunk);
                }
            }
        }

        createdChunks.forEach((chunk: Chunk) => {
            this._generateChunkGeometry(chunk);

            chunk.mesh = new Mesh(chunk.geometry, this._material);
            chunk.mesh.name = chunk.position.join(KEY_POS_DELIMITER);

            chunk.mesh.position.set(
                (chunk.position[0] * this._chunkSize),
                (chunk.position[1] * this._chunkSize),
                (chunk.position[2] * this._chunkSize),
            );

            chunk.mesh.position.x -= (this._chunkSize / 2);
            chunk.mesh.position.z -= (this._chunkSize / 2);

            this.add(chunk.mesh);
        });
    }

    public update(_deltaTime: number, playerPosition: Vector3 | POS) {
        if (this._material) {
            const position = this._playerPositionToChunkPosition(playerPosition);

            if (!this._getChunk(position)) {
                this._generateChunks(position);
            }
        }
    }
}
