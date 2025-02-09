import { MeshLambertMaterial, MeshLambertMaterialParameters, NearestFilter } from 'three';
import { TextureData } from './threejs-boiler-plate';

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

    uvWidth: number;
    uvHeight: number;

    maxVoxelNumber: number;

    constructor(params: VoxelMaterialParams) {
        super({
            map: params.textureData.texture,
            alphaTest: 0.1,
            transparent: true,
            ...params.materialParams ?? {},
        });


        this.textureData = params.textureData;

        this.tileWidth = params.tileWidth;
        this.tileHeight = params.tileHeight ?? this.tileWidth;

        this.uvWidth = this.tileWidth / this.textureData.width;
        this.uvHeight = this.tileHeight / this.textureData.height;

        this.textureData.texture.magFilter = NearestFilter;

        this.maxVoxelNumber = (this.textureData.width / this.tileWidth) * (this.textureData.height / this.tileHeight);
    }
}
