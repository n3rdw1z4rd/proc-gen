import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { NewChunkFunction, VoxelWorld } from './voxel-world';
import { log } from '../utils/logger';
import { TextureAtlas } from '../utils/texture-atlas';
import { VoxelMesh } from './voxel-mesh';
import { noise, FractalParams } from '../utils/perlin-noise';

log('voxels');

// const URL = '/minecraft-atlas.png';
const URL = '/flourish-cc-by-nc-sa.png';
const TEXTURE_WIDTH = 16;
const FILL_VOXEL = 1;

TextureAtlas.CreateFromUrl(
    URL,
    TEXTURE_WIDTH,
    TEXTURE_WIDTH,
    // { wireframe: true },
).then((textureAtlas: TextureAtlas) => {
    const eng = new ThreeJsBoilerPlate({ seed: 42 });
    eng.appendTo(document.getElementById('ROOT')!);
    eng.setupBasicScene({
        cameraDistance: 5,
        gridHelper: false,
    });

    // eng.scene.add(ThreeJsBoilerPlate.CreateCubeMesh());

    const fractalParams: FractalParams = {
        octaves: 2,
        frequency: 0.2,
        persistence: 0.3,
        amplitude: 1,
        lacunarity: 2.2,
    };

    const newChunkFunction: NewChunkFunction = function (this: VoxelMesh, pos: VEC3) {
        const [cx, _cy, cz] = this.position.floor().toArray();
        const [vx, vy, vz] = pos;

        const wx = cx + vx;
        const wz = cz + vz;

        const n = noise(wx, wz, fractalParams);
        const h = Math.floor(n * this.height);

        return vy < h ? FILL_VOXEL : 0;
    }

    const world = new VoxelWorld({
        chunkSize: 8,
        material: textureAtlas,
        newChunkFunction,
    });

    world.viewDistance = 1;

    eng.scene.add(world);

    world.update([0, 0, 0]);

    eng.clock.run((_dt: number) => {
        eng.resize();
        eng.renderer.render(eng.scene, eng.camera);
        eng.clock.showStats();
    });
});
