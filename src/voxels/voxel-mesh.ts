import { BufferAttribute, Mesh } from 'three';
import { VoxelMaterial } from '../utils/voxel-material';
import { xyz2i } from './utils';

export interface VoxelMeshParams {
    size?: number,
    height?: number,
    material: VoxelMaterial,
}

export class VoxelMesh extends Mesh {
    public readonly size: number;
    public readonly height: number;

    private _voxels: Map<string, number>;

    constructor(params: VoxelMeshParams) {
        super();

        this.size = Math.floor(params.size ?? 16);
        this.height = Math.floor(params.height ?? this.size);
        this.material = params.material;

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
                    this._voxels.set(xyz2i([x, y, z]), callback.bind(this)([x, y, z]));
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
                        VoxelFaces.forEach((faces: Array<number[]>) => {
                            const [dx, dy, dz] = faces[0];
                            const neighborVoxel = this.get([x + dx, y + dy, z + dz]);

                            if (!neighborVoxel) {
                                const positionIndex = positions.length / 3;

                                faces.forEach((faceVerts: number[]) => {
                                    const [nx, ny, nz, px, py, pz, ux, uy] = faceVerts;

                                    positions.push(x + px, y + py, z + pz);
                                    normals.push(nx, ny, nz);
                                    uvs.push(
                                        (voxel - 1 + ux) * (this.material as VoxelMaterial).uvWidth,
                                        1 - (1 - uy) * (this.material as VoxelMaterial).uvHeight,
                                    );
                                });

                                indices.push(
                                    positionIndex, positionIndex + 1, positionIndex + 2,
                                    positionIndex + 2, positionIndex + 1, positionIndex + 3,
                                );

                                needsUpdate = true;
                            }
                        });

                        this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
                        this.geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
                        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));

                        this.geometry.setIndex(indices);
                    }
                }
            }
        }

        if (needsUpdate) {
            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.computeVertexNormals();
        }
    }
}

const VoxelFaces: Array<Array<number[]>> = [ // [nx, ny, nz, px, py, pz, ux, uy]
    [ //left
        [-1, 0, 0, -0.5, 0.5, -0.5, 0, 1],
        [-1, 0, 0, -0.5, -0.5, -0.5, 0, 0],
        [-1, 0, 0, -0.5, 0.5, 0.5, 1, 1],
        [-1, 0, 0, -0.5, -0.5, 0.5, 1, 0],
    ],

    [ //right
        [1, 0, 0, 0.5, 0.5, 0.5, 0, 1],
        [1, 0, 0, 0.5, -0.5, 0.5, 0, 0],
        [1, 0, 0, 0.5, 0.5, -0.5, 1, 1],
        [1, 0, 0, 0.5, -0.5, -0.5, 1, 0],
    ],

    [ //bottom
        [0, -1, 0, 0.5, -0.5, 0.5, 1, 0],
        [0, -1, 0, -0.5, -0.5, 0.5, 0, 0],
        [0, -1, 0, 0.5, -0.5, -0.5, 1, 1],
        [0, -1, 0, -0.5, -0.5, -0.5, 0, 1],
    ],

    [ //top
        [0, 1, 0, -0.5, 0.5, 0.5, 1, 1],
        [0, 1, 0, 0.5, 0.5, 0.5, 0, 1],
        [0, 1, 0, -0.5, 0.5, -0.5, 1, 0],
        [0, 1, 0, 0.5, 0.5, -0.5, 0, 0],
    ],

    [ //back
        [0, 0, -1, 0.5, -0.5, -0.5, 0, 0],
        [0, 0, -1, -0.5, -0.5, -0.5, 1, 0],
        [0, 0, -1, 0.5, 0.5, -0.5, 0, 1],
        [0, 0, -1, -0.5, 0.5, -0.5, 1, 1],
    ],

    [ //front
        [0, 0, 1, -0.5, -0.5, 0.5, 0, 0],
        [0, 0, 1, 0.5, -0.5, 0.5, 1, 0],
        [0, 0, 1, -0.5, 0.5, 0.5, 0, 1],
        [0, 0, 1, 0.5, 0.5, 0.5, 1, 1],
    ],
];
