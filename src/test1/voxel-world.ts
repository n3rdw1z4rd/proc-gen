import { Group, MathUtils } from 'three';

const DEFAULT_CHUNK_SIZE: number = 8;
const DEFAULT_CHUNK_HEIGHT: number = 8;

const FACES = [
    { // left
        dir: [-1, 0, 0,],
        corners: [
            [0, 1, 0],
            [0, 0, 0],
            [0, 1, 1],
            [0, 0, 1],
        ],
    },
    { // right
        dir: [1, 0, 0,],
        corners: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    { // bottom
        dir: [0, -1, 0,],
        corners: [
            [1, 0, 1],
            [0, 0, 1],
            [1, 0, 0],
            [0, 0, 0],
        ],
    },
    { // top
        dir: [0, 1, 0,],
        corners: [
            [0, 1, 1],
            [1, 1, 1],
            [0, 1, 0],
            [1, 1, 0],
        ],
    },
    { // back
        dir: [0, 0, -1,],
        corners: [
            [1, 0, 0],
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 0],
        ],
    },
    { // front
        dir: [0, 0, 1,],
        corners: [
            [0, 0, 1],
            [1, 0, 1],
            [0, 1, 1],
            [1, 1, 1],
        ],
    },
];

export class VoxelWorld extends Group {
    private size: number = DEFAULT_CHUNK_SIZE;
    private height: number = DEFAULT_CHUNK_HEIGHT;
    private cell: Uint8Array;

    constructor() {
        super();

        this.cell = new Uint8Array(this.size * this.size * this.height);
        this.cell.fill(0);

        for (let y = 0; y < this.height; ++y) {
            for (let z = 0; z < this.size; ++z) {
                for (let x = 0; x < this.size; ++x) {
                    const height = (Math.sin(x / this.size * Math.PI * 2) + Math.sin(z / this.size * Math.PI * 3)) * (this.size / 6) + (this.size / 2);

                    if (y < height) {
                        this.setVoxel(x, y, z, 1);
                    }
                }
            }
        }
    }

    computeVoxelOffset(x: number, y: number, z: number) {
        const voxelX = MathUtils.euclideanModulo(x, this.size) | 0;
        const voxelY = MathUtils.euclideanModulo(y, this.height) | 0;
        const voxelZ = MathUtils.euclideanModulo(z, this.size) | 0;

        return voxelY * this.height + voxelZ * this.size + voxelX;
    }

    getCellForVoxel(x: number, y: number, z: number) {
        const cellX = Math.floor(x / this.size);
        const cellY = Math.floor(y / this.height);
        const cellZ = Math.floor(z / this.size);

        if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
            return null
        }

        return this.cell;
    }

    getVoxel(x: number, y: number, z: number) {
        const cell = this.getCellForVoxel(x, y, z);

        if (!cell) {
            return 0;
        }

        const voxelOffset = this.computeVoxelOffset(x, y, z);

        return cell[voxelOffset];
    }

    setVoxel(x: number, y: number, z: number, v: number) {
        let cell = this.getCellForVoxel(x, y, z);

        if (!cell) {
            return;  // TODO: add a new cell?
        }

        const voxelOffset = this.computeVoxelOffset(x, y, z);

        cell[voxelOffset] = v;
    }

    generateCellGeometry(x: number, y: number, z: number) {
        const positions = [];
        const normals = [];
        const indices = [];

        const startX = x * this.size;
        const startY = y * this.height;
        const startZ = z * this.size;

        for (let cy = 0; cy < this.height; cy++) {
            const voxelY = startY + cy;

            for (let cz = 0; cz < this.size; cz++) {
                const voxelZ = startZ + cz;

                for (let cx = 0; cx < this.size; cx++) {
                    const voxelX = startX + cx;
                    const voxel = this.getVoxel(voxelX, voxelY, voxelZ);

                    if (voxel) {
                        for (const { dir, corners } of FACES) {
                            const neighbor = this.getVoxel(
                                voxelX + dir[0],
                                voxelY + dir[1],
                                voxelZ + dir[2],
                            );

                            if (!neighbor) {
                                // draw face
                                const ndx = positions.length / 3;

                                for (const pos of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                    normals.push(...dir);
                                }

                                indices.push(
                                    ndx, ndx + 1, ndx + 2,
                                    ndx + 2, ndx + 1, ndx + 3,
                                );
                            }
                        }
                    }
                }
            }
        }

        return {
            positions,
            normals,
            indices,
        };
    }
}
