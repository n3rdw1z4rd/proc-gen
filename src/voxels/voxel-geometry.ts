import { BufferAttribute, BufferGeometry } from 'three';

export interface VoxelGeometryParams {
    size?: number,
    height?: number,
    uvWidth: number,
    uvHeight: number,
}

export class VoxelGeometry extends BufferGeometry {
    public readonly size: number;
    public readonly height: number;

    private _uvWidth: number;
    private _uvHeight: number;

    private _voxels: Map<string, number>;

    constructor(params: VoxelGeometryParams) {
        super();

        this.size = Math.floor(params.size ?? 16);
        this.height = Math.floor(params.height ?? this.size);

        this._uvWidth = params.uvWidth;
        this._uvHeight = params.uvHeight;

        this._voxels = new Map();
    }

    private _xyz2i(position: VEC3): string {
        const [x, y, z] = position;
        return `${x},${y},${z}`;
    }

    public get(position: VEC3): number {
        const voxel = this._voxels.get(this._xyz2i(position));
        return voxel ?? 0;
    }

    public set(position: VEC3, value: number, updateGeometry: boolean = true) {
        this._voxels.set(this._xyz2i(position), value);
        if (updateGeometry === true) this.updateGeometry();
    }

    public forEachVoxel(callback: (position: VEC3) => number, updateGeometry: boolean = true) {
        for (let x = 0; x < this.size; ++x) {
            for (let y = 0; y < this.height; ++y) {
                for (let z = 0; z < this.size; ++z) {
                    const value = callback.bind(this)([x, y, z]);
                    this._voxels.set(this._xyz2i([x, y, z]), value);
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
                                        ((voxel - 1) + ux) * this._uvWidth,
                                        1 - (1 - uy) * this._uvHeight,
                                    );
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
