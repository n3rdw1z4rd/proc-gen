import { NewChunkFunction, VoxelWorld } from "./voxel-world";
import { VoxelMesh } from "./voxel-mesh";
import {
    FractalParams,
    Noise,
    TextureAtlas,
    ThreeJsBoilerPlate,
} from "../core";
import { vec3 } from "gl-matrix";

// const URL = '/minecraft-atlas.png';
const URL = "/flourish-cc-by-nc-sa.png";
const TEXTURE_WIDTH = 16;
const FILL_VOXEL = 1;

TextureAtlas.CreateFromUrl(
    URL,
    TEXTURE_WIDTH,
    TEXTURE_WIDTH,
    // { wireframe: true },
).then((textureAtlas: TextureAtlas) => {
    const eng = new ThreeJsBoilerPlate({ seed: 42 });
    eng.appendTo(document.getElementById("root")!);
    eng.setupBasicScene({
        cameraDistance: 5,
        // gridHelper: false,
        enableControls: true,
    });

    // const fractalParams: FractalParams = {
    //     octaves: 2,
    //     frequency: 0.2,
    //     persistence: 0.3,
    //     amplitude: 1,
    //     lacunarity: 2.2,
    // };

    // const newChunkFunction: NewChunkFunction = function (
    //     this: VoxelMesh,
    //     pos: vec3,
    // ) {
    //     const [cx, _cy, cz] = this.position.floor().toArray();
    //     const [vx, vy, vz] = pos;

    //     const wx = cx + vx;
    //     const wz = cz + vz;

    //     const n = Noise.fractal2d(wx, wz, fractalParams);
    //     const h = Math.floor(n * this.height);

    //     return vy < h ? FILL_VOXEL : 0;
    // };

    // const world = new VoxelWorld({
    //     chunkSize: 8,
    //     material: textureAtlas,
    //     newChunkFunction,
    // });

    // world.viewDistance = 1;

    // eng.scene.add(world);

    // world.update([0, 0, 0]);

    const voxelMesh = new VoxelMesh({
        size: 3,
        height: 1,
        material: textureAtlas,
        inverted: true,
    });

    voxelMesh.set([0, 0, 0], 1);
    voxelMesh.set([1, 0, 0], 1);
    voxelMesh.set([0, 0, 1], 1);
    voxelMesh.set([0, 0, 2], 1);
    voxelMesh.updateGeometry();

    eng.scene.add(voxelMesh);

    eng.clock.run((_dt: number) => {
        eng.resize();
        eng.renderer.render(eng.scene, eng.camera);
        eng.clock.showStats();
    });
});
