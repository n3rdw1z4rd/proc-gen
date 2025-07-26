import { vec2 } from 'gl-matrix';
import { TextureLoader, Texture, MeshLambertMaterial, MeshLambertMaterialParameters, NearestFilter } from 'three';
import { log } from '../logger';

export interface TextureData {
    width: number,
    height: number,
    texture: Texture,
}

export function LoadTexture(url: string): Promise<TextureData> {
    return new Promise<TextureData>((res, rej) => {
        (new TextureLoader()).load(
            url,
            (texture: Texture) => {
                const width = texture.source.data.width;
                const height = texture.source.data.height;
                res({ width, height, texture });
            },
            (_ev) => { },
            (err) => rej(err),
        );
    });
}

export class TextureAtlas extends MeshLambertMaterial {
    private _uw: number;
    private _uh: number;
    private _textureCount: number;

    constructor(
        public readonly textureData: TextureData,
        public readonly textureWidth: number,
        public readonly textureHeight: number = textureWidth,
        params?: MeshLambertMaterialParameters,
    ) {
        super({
            map: textureData.texture,
            alphaTest: 0.1,
            transparent: true,
            ...params ?? {},
        });

        this._uw = this.textureWidth / this.textureData.width;
        this._uh = this.textureHeight / this.textureData.height;

        this._textureCount = this.textureData.width / this.textureWidth;

        this.textureData.texture.magFilter = NearestFilter;
    }

    getUv(voxel: number, ux: number, uy: number): vec2 {
        const vux = voxel % this._textureCount;
        const vuy = Math.floor(voxel / this._textureCount);

        const uvx = (vux + ux) * this._uw;
        const uvy = 1 - (vuy + uy) * this._uh;

        if (voxel === 0) log({ uvx, uvy });

        return vec2.fromValues(uvx, uvy);
    }

    // getUv(voxel: number, ux: number, uy: number): vec2 {
    //     const vux = (voxel % this._textureCount) * this._uw;
    //     const vuy = Math.floor(voxel / this._textureCount) * this._uh;

    //     const uvx = vux + (this._uw * ux);
    //     const uvy = vuy + (this._uh * uy);

    //     if (voxel ===32 && (ux===1||uy===1)) log({ voxel, vux, vuy, uvx, uvy });

    //     return vec2.fromValues(uvx, uvy);
    // }

    public static CreateFromUrl(
        url: string,
        textureWidth: number,
        textureHeight: number = textureWidth,
        params?: MeshLambertMaterialParameters,
    ): Promise<TextureAtlas> {
        return LoadTexture(url).then((textureData: TextureData) => new TextureAtlas(
            textureData,
            textureWidth,
            textureHeight,
            params,
        ));
    }
}
