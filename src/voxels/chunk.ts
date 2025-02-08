import { BufferAttribute, BufferGeometry } from 'three';
import { TextureAtlas } from '../utils/texture-atlas';
import { xyz2i } from './utils';

export class Chunk extends BufferGeometry {
    private _voxels: Map<string, number>;

    constructor(
        public textureAtlas: TextureAtlas,
        public readonly size: number = 16,
        public readonly height: number = size,
    ) {
        super();

        this._voxels = new Map<string, number>();
    }

    public get(position: VEC3): number {
        const voxel = this._voxels.get(xyz2i(position));
        return voxel ?? 0;
    }

    public set(position: VEC3, value: number, updateGeometry: boolean = true) {
        this._voxels.set(xyz2i(position), value);
        if (updateGeometry === true) this.updateGeometry();
    }

    public forEachVoxel(callback: (position: VEC3) => number, updateGeometry: boolean = true) {
        for (let x = 0; x < this.size; ++x) {
            for (let y = 0; y < this.height; ++y) {
                for (let z = 0; z < this.size; ++z) {
                    const value = callback.bind(this)([x, y, z]);

                    if (value >= 0 && value < this.textureAtlas.maxVoxelNumber) {
                        this._voxels.set(xyz2i([x, y, z]), value);
                    }
                }
            }
        }

        if (updateGeometry === true) this.updateGeometry();
    }

    public updateGeometry() {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        let needsUpdate: boolean = false;

        for (let x = 0; x < this.size; ++x) {
            for (let y = 0; y < this.height; ++y) {
                for (let z = 0; z < this.size; ++z) {
                    const voxel = this.get([x, y, z]);

                    if (voxel) {
                        FACES.forEach((faces: Array<number[]>) => {
                            const [dx, dy, dz] = faces[0];
                            const neighborVoxel = this.get([x + dx, y + dy, z + dz]);

                            if (!neighborVoxel) {
                                const positionIndex = positions.length / 3;

                                faces.forEach((faceVerts: number[]) => {
                                    const [nx, ny, nz, px, py, pz, _ux, _uy] = faceVerts;
                                    const [ux, uy] = this.textureAtlas.get(voxel - 1, _ux, _uy);

                                    positions.push(x + px, y + py, z + pz);
                                    normals.push(nx, ny, nz);
                                    uvs.push(ux, uy);
                                });

                                indices.push(
                                    positionIndex, positionIndex + 1, positionIndex + 2,
                                    positionIndex + 2, positionIndex + 1, positionIndex + 3,
                                );

                                needsUpdate = true;
                            }
                        });

                        this.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
                        this.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
                        this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));

                        this.setIndex(indices);
                    }
                }
            }
        }

        if (needsUpdate) {
            this.attributes.position.needsUpdate = true;
            this.computeVertexNormals();
        }
    }
}

const SCALE = 0.5;
const V = 1.0 * SCALE;

const FACES: Array<Array<number[]>> = [ // [nx, ny, nz, px, py, pz, ux, uy]
    [ //left
        [-1, 0, 0, -V, V, -V, 0, 1],
        [-1, 0, 0, -V, -V, -V, 0, 0],
        [-1, 0, 0, -V, V, V, 1, 1],
        [-1, 0, 0, -V, -V, V, 1, 0],
    ],

    [ //right
        [1, 0, 0, V, V, V, 0, 1],
        [1, 0, 0, V, -V, V, 0, 0],
        [1, 0, 0, V, V, -V, 1, 1],
        [1, 0, 0, V, -V, -V, 1, 0],
    ],

    [ //bottom
        [0, -1, 0, V, -V, V, 1, 0],
        [0, -1, 0, -V, -V, V, 0, 0],
        [0, -1, 0, V, -V, -V, 1, 1],
        [0, -1, 0, -V, -V, -V, 0, 1],
    ],

    [ //top
        [0, 1, 0, -V, V, V, 1, 1],
        [0, 1, 0, V, V, V, 0, 1],
        [0, 1, 0, -V, V, -V, 1, 0],
        [0, 1, 0, V, V, -V, 0, 0],
    ],

    [ //back
        [0, 0, -1, V, -V, -V, 0, 0],
        [0, 0, -1, -V, -V, -V, 1, 0],
        [0, 0, -1, V, V, -V, 0, 1],
        [0, 0, -1, -V, V, -V, 1, 1],
    ],

    [ //front
        [0, 0, 1, -V, -V, V, 0, 0],
        [0, 0, 1, V, -V, V, 1, 0],
        [0, 0, 1, -V, V, V, 0, 1],
        [0, 0, 1, V, V, V, 1, 1],
    ],
];
