import { NewChunkFunction, VoxelWorld } from "./voxel-world";
import { VoxelMesh } from "./voxel-mesh";
import {
    FractalParams,
    log,
    Noise,
    TextureAtlas,
    ThreeJsBoilerPlate,
} from "../core";
import { vec3 } from "gl-matrix";
import { CreateLevel } from "./create-level";

const URL = '/minecraft-atlas.png';
// const URL = "/flourish-cc-by-nc-sa.png";
const TEXTURE_WIDTH = 16;
const FILL_VOXEL = 1;

TextureAtlas.CreateFromUrl(
    URL,
    TEXTURE_WIDTH,
    TEXTURE_WIDTH,
    // { wireframe: true },
).then((textureAtlas: TextureAtlas) => {
    log('textureAtlas:', textureAtlas);

    const eng = new ThreeJsBoilerPlate();
    eng.appendTo(document.getElementById("root")!);
    eng.setupBasicScene({
        cameraDistance: 10,
        // gridHelper: false,
        enableControls: true,
    });

    // const fractalParams: FractalParams = {
    //     octaves: 1,
    //     frequency: 0.01,
    //     amplitude: 1,
    //     lacunarity: 2.0,
    //     persistence: 0.5,
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

    const mapSize = 32;
    const { map } = CreateLevel(mapSize, { plotWalls: true });

    const newChunkFunction: NewChunkFunction = function (
        this: VoxelMesh,
        pos: vec3,
    ) {
        const [px, _py, pz] = this.position.floor().toArray();
        const [vx, _vy, vz] = pos;

        // log({_py,_vy});

        const wx = px + vx;
        const wz = pz + vz;

        let value = 0;

        let mapValue = map.get(wx, wz);

        if (mapValue >= 0) {
            if (_vy === 0 || mapValue > 2) {
                value = [
                    0, 9 * 32, (9 * 32) + 1, 7 * 32, 35, 41, 42, 43, 4 * 32,
                ][mapValue];
            }
        }

        return value;
    };

    const world = new VoxelWorld({
        chunkSize: mapSize,
        chunkHeight: 2,
        material: textureAtlas,
        newChunkFunction,
    });

    world.position.set(-mapSize / 2, 0, -mapSize / 2);

    world.viewDistance = 1;

    eng.scene.add(world);

    world.update([0, 0, 0]);

    // const voxelMesh = new VoxelMesh({
    //     size: 3,
    //     height: 1,
    //     material: textureAtlas,
    // });

    // voxelMesh.set([0, 0, 0], 1);
    // voxelMesh.set([1, 0, 0], 1);
    // voxelMesh.set([0, 0, 1], 1);
    // voxelMesh.set([0, 0, 2], 1);
    // voxelMesh.updateGeometry();

    // eng.scene.add(voxelMesh);

    eng.clock.run((_dt: number) => {
        eng.resize();
        eng.renderer.render(eng.scene, eng.camera);
        eng.clock.showStats();
    });
});
