import { BufferAttribute, BufferGeometry, Mesh, MeshPhongMaterial } from 'three';
import { FACES } from '../voxel-engine/constants';
import { TextureAtlas } from '../utils/threejs-boiler-plate';
import { log } from '../utils/logger';

export class VoxelGeometry extends BufferGeometry {
    private _voxels: Uint8Array;
    private _uvWidth: number;
    private _uvHeight: number;

    constructor(
        public readonly size: number = 16,
        textureAtlas: TextureAtlas,
    ) {
        super();

        this._voxels = new Uint8Array(this.size * this.size * this.size);

        // TODO: replace with procedural generation:
        this._voxels.fill(1);

        this._uvWidth = textureAtlas.textureSize / textureAtlas.textureData.width;
        this._uvHeight = textureAtlas.textureSize / textureAtlas.textureData.height;

        this._generateGeometry();
    }

    private _voxelIndex(x: number, y: number, z: number): number {
        return (y * this.size * this.size) + (z * this.size) + x;
    }

    public getVoxel(x: number, y: number, z: number): number {
        const vin = this._voxelIndex(x, y, z);

        // log(`- getVoxel(${x}, ${y}, ${z}):`, vin);

        return (vin >= 0 && vin < this._voxels.length) ? this._voxels[vin] : 0;
    }

    public setVoxel(x: number, y: number, z: number, v: number) {
        const vin = this._voxelIndex(x, y, z);

        if (vin >= 0 && vin < this._voxels.length) {
            this._voxels[vin] = v;
            this._generateGeometry();
        }
    }

    private _generateGeometry() {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        for (let y = 0; y < this.size; ++y) {
            for (let z = 0; z < this.size; ++z) {
                for (let x = 0; x < this.size; ++x) {
                    const voxel = this.getVoxel(x, y, z);
                    log(`voxel(${x}, ${y}, ${z}):`, voxel);

                    if (voxel) {
                        const uvVoxel = voxel - 1;

                        for (const { dir, corners, uvRow } of FACES) {
                            const [nx, ny, nz] = [x + dir[0], y + dir[1], z + dir[2]];
                            const neighborVin = this.getVoxel(nx, ny, nz);
                            const neighborVoxel = (neighborVin > 0);

                            log(`- neighbor(${nx}, ${ny}, ${nz}) [${neighborVin}]:`, neighborVoxel);

                            if (!neighborVin) {
                                const ndx = positions.length / 3;

                                for (const { pos, uv } of corners) {
                                    positions.push(
                                        pos[0] + x,
                                        pos[1] + y,
                                        pos[2] + z
                                    );

                                    normals.push(...dir);

                                    uvs.push(
                                        (uvVoxel + uv[0]) * this._uvWidth,
                                        1 - (uvRow + 1 - uv[1]) * this._uvHeight,
                                    );
                                }

                                indices.push(
                                    ndx, ndx + 1, ndx + 2,
                                    ndx + 2, ndx + 1, ndx + 3,
                                );
                            }// else log(`- neighborVoxel(${nx}, ${ny}, ${nz}) [${neighborVin}]:`, neighborVoxel);
                        }
                    }
                }
            }
        }

        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;

        this.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(positions), positionNumComponents),
        );

        this.setAttribute(
            'normal',
            new BufferAttribute(new Float32Array(normals), normalNumComponents),
        );

        this.setAttribute(
            'uv',
            new BufferAttribute(new Float32Array(uvs), uvNumComponents),
        );

        this.setIndex(indices);
    }
}

export class ChunkMesh extends Mesh {
    constructor(
        public readonly size: number,
        textureAtlas: TextureAtlas,
    ) {
        super(
            new VoxelGeometry(size, textureAtlas),
            new MeshPhongMaterial({
                // map: textureAtlas.textureData.texture,
                alphaTest: 0.1,
                transparent: true,
            }),
        );

        const halfSize = (size / 2);
        this.position.set(-halfSize, -halfSize, -halfSize);
    }

    public getVoxel(x: number, y: number, z: number): number {
        return (this.geometry as VoxelGeometry).getVoxel(x, y, z);
    }

    public setVoxel(x: number, y: number, z: number, v: number) {
        (this.geometry as VoxelGeometry).setVoxel(x, y, z, v);
    }
}
