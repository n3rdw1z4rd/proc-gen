import { Texture } from 'three';
import { clamp } from './math';

export interface TextureData {
    width: number,
    height: number,
    texture: Texture,
}

export class TextureAtlas {
    tileWidth: number;
    tileHeight: number;
    textureWidth: number;
    textureHeight: number;

    texture: Texture;

    uvxSize: number;
    uvySize: number;

    maxVoxelNumber: number;

    constructor(textureData: TextureData, tileWidth: number = 16, tileHeight: number = tileWidth) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.textureWidth = textureData.width;
        this.textureHeight = textureData.height;
        this.texture = textureData.texture;

        this.uvxSize = this.tileWidth / this.textureWidth;
        this.uvySize = this.tileHeight / this.textureHeight;

        this.maxVoxelNumber = (this.textureWidth / this.tileWidth) * (this.textureHeight / this.tileHeight);
    }

    get(voxel: number, ux: number, uy: number): [number, number] {
        voxel = clamp(voxel, 0, this.maxVoxelNumber);

        const uvx = (voxel + ux) * this.uvxSize;
        const uvy = 1 - (1 - uy) * this.uvySize;

        return [uvx, uvy];
    }
}
