import { BufferAttribute, BufferGeometry, DoubleSide, MathUtils, Mesh, MeshLambertMaterial, NearestFilter, SRGBColorSpace, TextureLoader } from 'three';
import { ThreeJsDevelopmentEnvironment } from '../test1/dev-env';
import { rng } from '../utils';

const env = new ThreeJsDevelopmentEnvironment(document.getElementById('ROOT_DIV')!);

interface VoxelWorldParams {
    cellSize: number;
    tileSize: number;
    tileTextureWidth: number;
    tileTextureHeight: number;
}

class VoxelWorld {
    cellSize: number;
    tileSize: number;
    tileTextureWidth: number;
    tileTextureHeight: number;
    cell: Uint8Array;
    cellSliceSize: number;

    constructor(options: VoxelWorldParams) {
        this.cellSize = options.cellSize;
        this.tileSize = options.tileSize;
        this.tileTextureWidth = options.tileTextureWidth;
        this.tileTextureHeight = options.tileTextureHeight;
        this.cellSliceSize = this.cellSize * this.cellSize;
        this.cell = new Uint8Array(this.cellSize * this.cellSize * this.cellSize);
    }

    public static faces = [
        { // left
            uvRow: 0,
            dir: [-1, 0, 0,],
            corners: [
                { pos: [0, 1, 0], uv: [0, 1], },
                { pos: [0, 0, 0], uv: [0, 0], },
                { pos: [0, 1, 1], uv: [1, 1], },
                { pos: [0, 0, 1], uv: [1, 0], },
            ],
        },
        { // right
            uvRow: 0,
            dir: [1, 0, 0,],
            corners: [
                { pos: [1, 1, 1], uv: [0, 1], },
                { pos: [1, 0, 1], uv: [0, 0], },
                { pos: [1, 1, 0], uv: [1, 1], },
                { pos: [1, 0, 0], uv: [1, 0], },
            ],
        },
        { // bottom
            uvRow: 1,
            dir: [0, -1, 0,],
            corners: [
                { pos: [1, 0, 1], uv: [1, 0], },
                { pos: [0, 0, 1], uv: [0, 0], },
                { pos: [1, 0, 0], uv: [1, 1], },
                { pos: [0, 0, 0], uv: [0, 1], },
            ],
        },
        { // top
            uvRow: 2,
            dir: [0, 1, 0,],
            corners: [
                { pos: [0, 1, 1], uv: [1, 1], },
                { pos: [1, 1, 1], uv: [0, 1], },
                { pos: [0, 1, 0], uv: [1, 0], },
                { pos: [1, 1, 0], uv: [0, 0], },
            ],
        },
        { // back
            uvRow: 0,
            dir: [0, 0, -1,],
            corners: [
                { pos: [1, 0, 0], uv: [0, 0], },
                { pos: [0, 0, 0], uv: [1, 0], },
                { pos: [1, 1, 0], uv: [0, 1], },
                { pos: [0, 1, 0], uv: [1, 1], },
            ],
        },
        { // front
            uvRow: 0,
            dir: [0, 0, 1,],
            corners: [
                { pos: [0, 0, 1], uv: [0, 0], },
                { pos: [1, 0, 1], uv: [1, 0], },
                { pos: [0, 1, 1], uv: [0, 1], },
                { pos: [1, 1, 1], uv: [1, 1], },
            ],
        },
    ];

    getCellForVoxel(x: number, y: number, z: number) {
        const { cellSize } = this;

        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellZ = Math.floor(z / cellSize);

        if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
            return null
        }

        return this.cell;
    }

    computeVoxelOffset(x: number, y: number, z: number) {
        const { cellSize, cellSliceSize } = this;

        const voxelX = MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = MathUtils.euclideanModulo(y, cellSize) | 0;
        const voxelZ = MathUtils.euclideanModulo(z, cellSize) | 0;

        return voxelY * cellSliceSize + voxelZ * cellSize + voxelX;
    }

    setVoxel(x: number, y: number, z: number, v: number) {
        let cell = this.getCellForVoxel(x, y, z);

        if (!cell) {
            return;  // TODO: add a new cell?
        }

        const voxelOffset = this.computeVoxelOffset(x, y, z);

        cell[voxelOffset] = v;
    }

    getVoxel(x: number, y: number, z: number) {
        const cell = this.getCellForVoxel(x, y, z);

        if (!cell) {
            return 0;
        }

        const voxelOffset = this.computeVoxelOffset(x, y, z);

        return cell[voxelOffset];
    }

    generateGeometryDataForCell(cellX: number, cellY: number, cellZ: number) {
        const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;

        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        const startX = cellX * cellSize;
        const startY = cellY * cellSize;
        const startZ = cellZ * cellSize;

        for (let y = 0; y < cellSize; ++y) {
            const voxelY = startY + y;

            for (let z = 0; z < cellSize; ++z) {
                const voxelZ = startZ + z;

                for (let x = 0; x < cellSize; ++x) {
                    const voxelX = startX + x;
                    const voxel = this.getVoxel(voxelX, voxelY, voxelZ);

                    if (voxel) {
                        const uvVoxel = voxel - 1;

                        for (const { dir, corners, uvRow } of VoxelWorld.faces) {
                            const neighbor = this.getVoxel(
                                voxelX + dir[0],
                                voxelY + dir[1],
                                voxelZ + dir[2]
                            );

                            if (!neighbor) {
                                const ndx = positions.length / 3;

                                for (const { pos, uv } of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                    normals.push(...dir);
                                    uvs.push(
                                        (uvVoxel + uv[0]) * tileSize / tileTextureWidth,
                                        1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight,
                                    );
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
            uvs,
        };
    }
}

const loader = new TextureLoader();
const texture = loader.load('/flourish-cc-by-nc-sa.png');
texture.magFilter = NearestFilter;
texture.minFilter = NearestFilter;
texture.colorSpace = SRGBColorSpace;

const cellSize = 16;
const tileSize = 16;
const tileTextureWidth = 256;
const tileTextureHeight = 64;

const world = new VoxelWorld({
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
});

for (let y = 0; y < cellSize; ++y) {
    for (let z = 0; z < cellSize; ++z) {
        for (let x = 0; x < cellSize; ++x) {
            const height = (Math.sin(x / cellSize * Math.PI * 2) + Math.sin(z / cellSize * Math.PI * 3)) * (cellSize / 6) + (cellSize / 2);

            if (y < height) {
                world.setVoxel(
                    x, y, z,
                    // 1,
                    rng.range(1, 17),
                );
            }
        }
    }
}

const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(0, 0, 0);

const geometry = new BufferGeometry();
const material = new MeshLambertMaterial({
    map: texture,
    // side: DoubleSide,
    alphaTest: 0.1,
    transparent: true,
});

const positionNumComponents = 3;
const normalNumComponents = 3;
const uvNumComponents = 2;

geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), positionNumComponents)
);

geometry.setAttribute(
    'normal',
    new BufferAttribute(new Float32Array(normals), normalNumComponents)
);

geometry.setAttribute(
    'uv',
    new BufferAttribute(new Float32Array(uvs), uvNumComponents)
);

geometry.setIndex(indices);

const mesh = new Mesh(geometry, material);

env.scene.add(mesh);
env.camera.position.z = 20;

env.clock.run((deltaTime: number) => {
    env.resize();

    // update scene:

    env.controls.update(deltaTime);
    env.renderer.render(env.scene, env.camera);
    env.clock.showStats({});
});