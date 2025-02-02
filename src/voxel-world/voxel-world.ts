import { Group, Material, MeshPhongMaterial, NearestFilter, Vector3 } from 'three';
import { VoxelChunk } from './voxel-chunk';
import { log } from '../utils/logger';
import { TextureData } from '../utils/threejs-boiler-plate';

export interface VoxelWorldParams {
    chunkSize?: number,
    textureData: TextureData,
    textureSize?: number,
}

export class VoxelWorld extends Group {
    private _chunkSize: number = 16;
    private _viewDistance: number = 1;

    private _textureSize: number = 16;
    private _textureData: TextureData;
    private _material: Material;

    private _chunks: Map<string, VoxelChunk>;

    constructor(params: VoxelWorldParams) {
        super();

        this._chunkSize = params.chunkSize ?? this._chunkSize;
        this._textureSize = params.textureSize ?? this._textureSize;
        this._textureData = params.textureData;

        this._textureData.texture.magFilter = NearestFilter;

        this._material = new MeshPhongMaterial({
            map: this._textureData.texture,
            alphaTest: 0.1,
            transparent: true,
        });

        this._chunks = new Map<string, VoxelChunk>();
    }

    private _xz2key(x: number, z: number): string {
        return `${x},${z}`;
    }

    private _getChunk(x: number, z: number): VoxelChunk | undefined {
        return this._chunks.get(this._xz2key(x, z));
    }

    public getVoxel(x: number, y: number, z: number): number {
        log('VoxelWorld.getVoxel:', { x, y, z });

        const cx = ((x / this._chunkSize) | 0);
        const cz = ((z / this._chunkSize) | 0);

        log('chunk:', { cx, cz });

        return this._getChunk(cx, cz)?.getVoxel(x, y, z) ?? 0;
    }

    public setVoxel(x: number, y: number, z: number, voxel: number) {
        log('VoxelWorld.setVoxel:', { x, y, z, voxel });

        const cx = ((x / this._chunkSize) | 0);
        const cz = ((z / this._chunkSize) | 0);

        log('chunk:', { cx, cz });

        this._getChunk(cx, cz)?.setVoxel(x, y, z, voxel);
    }

    public update(_deltaTime: number, playerPosition: Vector3) {
        if (this._textureData) {
            const [px, _py, pz] = playerPosition.toArray();

            const x = ((px / this._chunkSize) | 0);
            const z = ((pz / this._chunkSize) | 0);

            for (let xo = -this._viewDistance; xo <= this._viewDistance; xo++) {
                for (let zo = -this._viewDistance; zo <= this._viewDistance; zo++) {
                    if (!this._getChunk(x + xo, z + zo)) {
                        const cx = x + xo;
                        const cz = z + zo;

                        const chunk = new VoxelChunk({
                            size: this._chunkSize,
                            textureData: this._textureData,
                            textureSize: this._textureSize,
                            material: this._material,
                        });

                        chunk.position.set(cx * this._chunkSize, 0, cz * this._chunkSize);

                        chunk.generateVoxels(1);
                        chunk.update();

                        this._chunks.set(this._xz2key(cx, cz), chunk);

                        this.add(chunk);
                    }
                }
            }
        }
    }
}