import { Group } from 'three';
import { VoxelMesh } from './voxel-mesh';
import { xyz2i } from './utils';
import { vec2, vec3 } from 'gl-matrix';
import { TextureAtlas } from '../core';

export type NewChunkFunction = (position: vec3) => number;

export interface VoxelWorldParams {
    chunkSize?: number,
    chunkHeight?: number,
    material: TextureAtlas,
    newChunkFunction?: NewChunkFunction,
}

export class VoxelWorld extends Group {
    public readonly chunkSize: number;
    public readonly chunkHeight: number;

    private _chunks: Map<string, VoxelMesh>;
    private _material: TextureAtlas;

    public viewDistance: number = 0;
    public newChunkFunction: NewChunkFunction | undefined;

    constructor(params: VoxelWorldParams) {
        super();

        this.chunkSize = Math.floor(params.chunkSize ?? 16);
        this.chunkHeight = Math.floor(params.chunkHeight ?? this.chunkSize);
        this.newChunkFunction = params.newChunkFunction;
        this._material = params.material;;

        this._chunks = new Map();

        this.update();
    }

    // public getVoxel(position: VEC3): number {
    //     const [wx, wy, wz] = position;

    //     const cx = Math.floor(wx / this.chunkSize);
    //     const cz = Math.floor(wz / this.chunkSize);

    //     return (this._chunks.get(xyz2i([cx, 0, cz]))?.geometry as ChunkGeometry)
    //         .get([
    //             wx / this.chunkSize,
    //             wy / this.chunkHeight,
    //             wx / this.chunkSize
    //         ]) ?? 0;
    // }

    // public setVoxel(position: VEC3, value: number) {

    // }

    public updateChunk(pos: vec2) {
        const [px, pz] = pos;
        const chunk = this._chunks.get(xyz2i([px, 0, pz]));
        chunk?.updateGeometry();
    }

    public updateChunks() {
        this._chunks.forEach((chunk: VoxelMesh) => chunk.updateGeometry());
    }

    public update(position: vec3 = [0, 0, 0]) {
        const [px, _py, pz] = position;

        const x = ((px / this.chunkSize) | 0);
        const z = ((pz / this.chunkSize) | 0);

        for (let xo = -this.viewDistance; xo <= this.viewDistance; xo++) {
            for (let zo = -this.viewDistance; zo <= this.viewDistance; zo++) {
                const chunkIndex = xyz2i([x + xo, 0, z + zo]);

                if (!this._chunks.get(chunkIndex)) {
                    const cx = Math.floor((x + xo) * this.chunkSize);
                    const cz = Math.floor((z + zo) * this.chunkSize);

                    const chunk = new VoxelMesh({
                        size: this.chunkSize,
                        height: this.chunkHeight,
                        material: this._material,
                    });

                    chunk.position.set(cx, 0, cz);

                    chunk.forEachVoxel((pos: vec3) => {
                        return this.newChunkFunction
                            ? this.newChunkFunction.bind(chunk)(pos)
                            : 1;
                    });

                    this._chunks.set(chunkIndex, chunk);
                    this.add(chunk);
                }
            }
        }
    }
}
