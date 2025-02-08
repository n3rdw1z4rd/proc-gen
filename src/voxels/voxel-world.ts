import { Group, Material, Mesh, MeshPhongMaterial } from 'three';
import { TextureAtlas } from '../utils/texture-atlas';
import { Chunk } from './chunk';
import { xyz2i } from './utils';

export class VoxelWorld extends Group {
    private _chunks: Map<string, Mesh>;
    private _textureAtlas: TextureAtlas;
    private _material: Material;

    private _viewDistance: number = 1;

    constructor(
        textureAtlas: TextureAtlas,
        public readonly chunkSize: number = 16,
        public readonly chunkHeight: number = chunkSize,
    ) {
        super();

        this._chunks = new Map<string, Mesh>();

        this._textureAtlas = textureAtlas;

        this._material = new MeshPhongMaterial({
            map: this._textureAtlas.texture,
            alphaTest: 0.1,
            transparent: true,
        });
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
        const [px, py, pz] = position;

        const x = ((px / this.chunkSize) | 0);
        const z = ((pz / this.chunkSize) | 0);

        for (let xo = -this._viewDistance; xo <= this._viewDistance; xo++) {
            for (let zo = -this._viewDistance; zo <= this._viewDistance; zo++) {
                const chunkIndex = xyz2i([x + xo, 0, z + zo]);

                if (!this._chunks.get(chunkIndex)) {
                    const cx = x + xo;
                    const cz = z + zo;

                    const chunkGeometry = new Chunk(this._textureAtlas, this.chunkSize, this.chunkHeight);
                    chunkGeometry.forEachVoxel(() => 1);

                    const chunkMesh = new Mesh(chunkGeometry, this._material);
                    chunkMesh.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);

                    this._chunks.set(chunkIndex, chunkMesh);
                    this.add(chunkMesh);
                }
            }
        }
    }
}