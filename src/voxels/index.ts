import { TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { VoxelWorld } from './voxel-world';
import { VoxelMaterial } from '../utils/voxel-material';
import { log } from '../utils/logger';

log('voxels');

rng.seed = 42;

ThreeJsBoilerPlate
    // .LoadTexture('/minecraft-atlas.png')
    .LoadTexture('/flourish-cc-by-nc-sa.png')
    .then((textureData: TextureData) => {
        const eng = new ThreeJsBoilerPlate();
        eng.appendTo(document.getElementById('ROOT')!);
        eng.setupBasicScene({
            cameraDistance: 25,
            gridHelper: false,
        });

        const voxelMaterial: VoxelMaterial = new VoxelMaterial(textureData, 16);

        const world = new VoxelWorld(1, 1, voxelMaterial);
        eng.scene.add(world);

        eng.scene.add(ThreeJsBoilerPlate.CreateCubeMesh());

        eng.clock.run((_dt: number) => {
            eng.resize();
            world.update([0, 0, 0]);
            eng.renderer.render(eng.scene, eng.camera);
            eng.clock.showStats();
        });
    });
