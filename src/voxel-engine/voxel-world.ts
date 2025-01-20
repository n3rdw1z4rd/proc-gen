import { VoxelChunk } from './voxel-chunk';
import { Group, Material, MeshPhongMaterial, NearestFilter, Texture, TextureLoader, Vector3 } from 'three';

export type XYZ = [number, number, number];

export class VoxelWorld extends Group {
    private _chunks: Map<string, VoxelChunk> = new Map<string, VoxelChunk>();

    private _chunkSize: number = 16;

    private _atlas: Texture | undefined;
    private _atlasWidth: number = 0;
    private _atlasHeight: number = 0;
    private _textureSize: number = 16;

    private _material: Material | undefined;

    public constructor() {
        super();
    }

    public loadTexture(url: string) {
        (new TextureLoader()).load(url, (texture: Texture) => {
            this._atlas = texture;
            this._atlas.magFilter = NearestFilter;
            this._atlasWidth = texture.source.data.width;
            this._atlasHeight = texture.source.data.height;

            this._material = new MeshPhongMaterial({
                map: this._atlas,
                alphaTest: 0.1,
                transparent: true,
            });
        });
    }

    public setPlayerPosition(x: Vector3 | XYZ | number, y: number, z: number) {
        if (x instanceof Vector3) {
            y = x.y;
            z = x.z;
            x = x.x;
        } else if (Array.isArray(x)) {
            [x, y, z] = x;
        }
    }

    private _generateChunk(position: XYZ) {
        if (this._material) {
            const chunk = new VoxelChunk({
                chunkSize: this._chunkSize,
                tileSize: this._textureSize,
                tileTextureWidth: this._atlasWidth,
                tileTextureHeight: this._atlasHeight,
            });

            chunk.generateRandomVoxels(); // TODO: use noise function

            this._chunks.set(position.join('x'), chunk);

            const chunkMesh = chunk.generateMesh(this._material!);
            chunkMesh.position.x -= (this._chunkSize / 2);
            chunkMesh.position.z -= (this._chunkSize / 2);

            this.add(chunkMesh);
        }
    }

    public update(_deltaTime: number, position: XYZ | Vector3 = [0, 0, 0]) {
        if (position instanceof Vector3) position = position.toArray();

        position = position.map((value: number) => Math.floor(value / this._chunkSize)) as XYZ;

        if (!this._chunks.has(position.join('x'))) {
            this._generateChunk(position);
        }
    }
}