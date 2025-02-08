import { Group } from 'three';
import { VoxelMaterial } from '../utils/voxel-material';
import { VoxelChunk } from './voxel-chunk';
import { xyz2i } from './utils';
import { rng } from '../utils/rng';

export interface VoxelWorldParams {
    chunkSize: number,
    chunkHeight?: number,
    material: VoxelMaterial,
}

export class VoxelWorld extends Group {
    public readonly chunkSize: number;
    public readonly chunkHeight: number;

    private _chunks: Map<string, VoxelChunk>;
    private _material: VoxelMaterial;

    private _viewDistance: number = 0;

    constructor(
        chunkSize: number,
        chunkHeight: number,
        material: VoxelMaterial,
    ) {
        super();

        this.chunkSize = chunkSize;
        this.chunkHeight = chunkHeight;
        this._material = material;

        this._chunks = new Map();
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

    public update(position: VEC3) {
        const [px, _py, pz] = position;

        const x = ((px / this.chunkSize) | 0);
        const z = ((pz / this.chunkSize) | 0);

        for (let xo = -this._viewDistance; xo <= this._viewDistance; xo++) {
            for (let zo = -this._viewDistance; zo <= this._viewDistance; zo++) {
                const chunkIndex = xyz2i([x + xo, 0, z + zo]);

                if (!this._chunks.get(chunkIndex)) {
                    const cx = x + xo;
                    const cz = z + zo;

                    const chunk = new VoxelChunk(this.chunkSize, this.chunkHeight, this._material);

                    chunk.forEachVoxel(() => rng.range(1, 17));

                    chunk.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);

                    this._chunks.set(chunkIndex, chunk);
                    this.add(chunk);
                }
            }
        }
    }
}