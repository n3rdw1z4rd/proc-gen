import { TextureData } from './threejs-boiler-plate';
import { MeshLambertMaterial, MeshLambertMaterialParameters, NearestFilter, Texture } from 'three';
import { clamp } from './math';

export interface VoxelMaterialParams {
    material?: MeshLambertMaterialParameters,
    textureData: TextureData,
    tileWidth: number,
    tileHeight?: number,
}

export class VoxelMaterial extends MeshLambertMaterial {
    tileWidth: number;
    tileHeight: number;
    textureWidth: number;
    textureHeight: number;

    texture: Texture;

    uvxSize: number;
    uvySize: number;

    maxVoxelNumber: number;

    constructor(params: VoxelMaterialParams) {
        super({
            map: params.textureData.texture,
            alphaTest: 0.1,
            transparent: true,
            ...params.material,
        });

        this.tileWidth = params.tileWidth;
        this.tileHeight = params.tileHeight ?? this.tileWidth;

        this.textureWidth = params.textureData.width;
        this.textureHeight = params.textureData.height;
        this.texture = params.textureData.texture;

        this.texture.magFilter = NearestFilter;

        this.uvxSize = this.tileWidth / this.textureWidth;
        this.uvySize = this.tileHeight / this.textureHeight;

        this.maxVoxelNumber = (this.textureWidth / this.tileWidth) * (this.textureHeight / this.tileHeight);
    }

    getVoxelTextureUvs(voxel: number, ux: number, uy: number): VEC2 {
        voxel = clamp(voxel, 0, this.maxVoxelNumber);

        const uvx = (voxel + ux) * this.uvxSize;
        const uvy = 1 - (1 - uy) * this.uvySize;

        return [uvx, uvy];
    }
}
