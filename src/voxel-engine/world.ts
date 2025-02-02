import { BoxGeometry, BufferAttribute, BufferGeometry, Group, Material, MathUtils, Mesh, Vector3 } from 'three';
import { rng } from '../utils/rng';
import { FACES } from './constants';
import { log } from '../utils/logger';

const KEY_POS_DELIMITER = 'x';

export interface ChunkParams {
    size: number,
    textureWidth: number,
    textureHeight: number,
    textureSize: number,
    material: Material,
}

export class Chunk extends Mesh {
    private _size: number;
    private _geometryOffset: VEC3;
    private _textureWidth: number;
    private _textureHeight: number;
    private _textureSize: number;

    private _voxels: Uint8Array;

    public needsGeometryUpdate: boolean = true;

    constructor(params: ChunkParams) {
        super();

        this._size = params.size;
        this._geometryOffset = [-this._size / 2, -this._size / 2, -this._size / 2];
        this._textureWidth = params.textureWidth;
        this._textureHeight = params.textureHeight;
        this._textureSize = params.textureSize;

        this._voxels = new Uint8Array(this._size * this._size * this._size);

        this.material = params.material;

        this._generateChunkTerrain();

        // this.geometry = new BoxGeometry();

        // this._generateChunkGeometry();
        // this.onBeforeRender = this._onBeforeRender.bind(this);

        this.onBeforeRender = () => {
            log('onBeforeRender');

            if (this.needsGeometryUpdate) {
                this._generateChunkGeometry();
                this.needsGeometryUpdate = false;
            }
        };
    }

    private _computeChunkIndex(position: VEC3) {
        let [x, y, z] = position;

        x = MathUtils.euclideanModulo(x, this._size) | 0;
        y = MathUtils.euclideanModulo(y, this._size) | 0;
        z = MathUtils.euclideanModulo(z, this._size) | 0;

        return y * (this._size * this._size) + z * this._size + x;
    }

    private _getVoxelInChunk(position: VEC3): number {
        let voxel: number = 0;

        if (position.every((v: number) => (v >= 0 && v < this._size))) {
            const i = this._computeChunkIndex(position);

            if (i >= 0 && i < this._voxels.length) {
                voxel = this._voxels[i];
            }
        } else {
            // TODO: voxel outside this chunk, need to get it's value
        }

        return voxel;
    }

    private _generateChunkTerrain() {
        for (let y = 0; y < this._size; ++y) {
            for (let z = 0; z < this._size; ++z) {
                for (let x = 0; x < this._size; ++x) {
                    const height = this._size;
                    // (Math.sin(x / this._size * Math.PI * 2) + Math.sin(z / this._size * Math.PI * 3)) * (this._size / 6) + (this._size / 2);

                    if (y < height) {
                        const i = this._computeChunkIndex([x, y, z]);

                        if (i >= 0 && i < this._voxels.length) {
                            this._voxels[i] = rng.range(1, 17);
                        }
                    }
                }
            }
        }
    }

    private _generateChunkGeometry() {
        log('_generateChunkGeometry');

        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        for (let y = 0; y < this._size; ++y) {
            for (let z = 0; z < this._size; ++z) {
                for (let x = 0; x < this._size; ++x) {
                    const voxelPos: VEC3 = [x, y, z];
                    const voxel = this._getVoxelInChunk(voxelPos);

                    // log('voxel:', voxel, voxelPos);

                    if (voxel) {
                        const uvVoxel = voxel - 1;

                        for (const { dir, corners, uvRow } of FACES) {
                            const neighborPos: VEC3 = [voxelPos[0] + dir[0], voxelPos[1] + dir[1], voxelPos[2] + dir[2]];
                            const neighborVoxel = this._getVoxelInChunk(neighborPos);

                            // log('neighborVoxel:', neighborVoxel, neighborPos);

                            if (!neighborVoxel) {
                                const ndx = positions.length / 3;

                                for (const { pos, uv } of corners) {
                                    positions.push(
                                        pos[0] + x + this._geometryOffset[0],
                                        pos[1] + y + this._geometryOffset[0],
                                        pos[2] + z + this._geometryOffset[0]
                                    );

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

        // TODO: geometry.needsUpdate = true // "needsUpdate" prop doesn't exist
        // this.geometry.elements
    }
}

export interface WorldParams extends ChunkParams {

}

export class World extends Group {
    private _size: number;
    private _textureWidth: number;
    private _textureHeight: number;
    private _textureSize: number;
    private _material: Material;

    private _chunks: Map<string, Chunk>;
    private _chunkRenderRange: number = 1;

    public get size(): number { return this._size; }

    constructor(params: WorldParams) {
        super();

        this._size = params.size;
        this._textureWidth = params.textureWidth;
        this._textureHeight = params.textureHeight;
        this._textureSize = params.textureSize;
        this._material = params.material;

        this._chunks = new Map<string, Chunk>();
    }

    private _getChunkKey(position: VEC3): string {
        return position.join(KEY_POS_DELIMITER);
    }

    private _getChunk(position: VEC3): Chunk | null {
        const key = this._getChunkKey(position);
        return this._chunks.get(key) ?? null;
    }

    public getVoxel(position: VEC3 | Vector3): number {
        if (!Array.isArray(position)) {
            position = position.toArray() as VEC3;
        }

        log('getVoxel:', position);

        let voxel: number = 0;

        const wx = position[0] / this._size;
        const wy = position[1] / this._size;
        const wz = position[2] / this._size;

        log({ wx, wy, wz });

        // const chunk = this._getChunk([
        //     position[0] | 0,
        //     position[1] | 0,
        //     position[2] | 0,
        // ]);

        // if (chunk) {
        //     const i = this._computeChunkIndex(position);

        //     if (i >= 0 && i < chunk.data.length) {
        //         voxel = chunk.data[i];
        //     }
        // }

        return voxel;
    }

    private _playerPositionToChunkPosition(playerPosition: Vector3 | VEC3): VEC3 {
        playerPosition = (playerPosition instanceof Vector3) ? playerPosition.toArray() : playerPosition;

        return [
            (playerPosition[0] / this._size) | 0,
            (playerPosition[1] / this._size) | 0,
            (playerPosition[2] / this._size) | 0,
        ];
    }

    private _generateChunks(position: VEC3) {
        log('_generateChunks:', position);

        const offset = this._chunkRenderRange;
        // const createdChunks = [];

        for (let x = -offset; x <= offset; x++) {
            for (let z = -offset; z <= offset; z++) {
                const pos: VEC3 = [position[0] + x, position[1], position[2] + z];

                if (!this._getChunk(pos)) {
                    const chunk = new Chunk({
                        size: this._size,
                        textureWidth: this._textureWidth,
                        textureHeight: this._textureHeight,
                        textureSize: this._textureSize,
                        material: this._material,
                    });

                    chunk.position.set(...position);

                    log('new chunk:', chunk);

                    this.add(chunk);
                }
            }
        }

        // createdChunks.forEach((chunk: Chunk) => {
        //     this._generateChunkGeometry(chunk);

        //     chunk.mesh = new Mesh(chunk.geometry, this._material);
        //     chunk.mesh.name = chunk.position.join(KEY_POS_DELIMITER);

        //     chunk.mesh.position.set(
        //         (chunk.position[0] * this._chunkSize),
        //         (chunk.position[1] * this._chunkSize),
        //         (chunk.position[2] * this._chunkSize),
        //     );

        //     chunk.mesh.position.x -= (this._chunkSize / 2);
        //     chunk.mesh.position.z -= (this._chunkSize / 2);

        //     this.add(chunk.mesh);
        // });
    }

    public update(_deltaTime: number, playerPosition: Vector3 | VEC3) {
        const position = this._playerPositionToChunkPosition(playerPosition);

        if (!this._getChunk(position)) {
            // this._generateChunks(position);
        }
    }
}