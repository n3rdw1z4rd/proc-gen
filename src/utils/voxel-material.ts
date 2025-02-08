import { TextureData } from './threejs-boiler-plate';
import { MeshLambertMaterial, MeshLambertMaterialParameters, NearestFilter } from 'three';
import { clamp } from './math';

export interface VoxelMaterialParams {
    textureData: TextureData,
    tileWidth: number,
    tileHeight?: number,
    materialParams?: MeshLambertMaterialParameters,
}

export class VoxelMaterial extends MeshLambertMaterial {
    textureData: TextureData;

    tileWidth: number;
    tileHeight: number;

    uvxSize: number;
    uvySize: number;

    maxVoxelNumber: number;

    constructor(
        textureData: TextureData,
        tileWidth: number = 16,
        tileHeight: number = tileWidth,
        materialParams: MeshLambertMaterialParameters = {},
    ) {
        textureData.texture.magFilter = NearestFilter;

        super({
            map: textureData.texture,
            alphaTest: 0.1,
            transparent: true,
            ...materialParams,
        });

        this.textureData = textureData;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.uvxSize = this.tileWidth / this.textureData.width;
        this.uvySize = this.tileHeight / this.textureData.height;

        this.maxVoxelNumber = (this.textureData.width / this.tileWidth) * (this.textureData.height / this.tileHeight);
    }

    getVoxelTextureUvs(voxel: number, ux: number, uy: number): VEC2 {
        voxel = clamp(voxel, 0, this.maxVoxelNumber);

        const uvx = (voxel + ux) * this.uvxSize;
        const uvy = 1 - (1 - uy) * this.uvySize;

        return [uvx, uvy];
    }
}
