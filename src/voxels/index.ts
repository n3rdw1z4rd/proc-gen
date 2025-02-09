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
            cameraDistance: 5,
            gridHelper: false,
        });

        const voxelMaterial: VoxelMaterial = new VoxelMaterial(textureData, 16, 16, { wireframe: true });

        const chunkSize = 2;
        const world = new VoxelWorld(chunkSize, chunkSize, voxelMaterial);
        eng.scene.add(world);

        eng.scene.add(ThreeJsBoilerPlate.CreateCubeMesh());

        world.update([0, 0, 0]);
        
        eng.clock.run((_dt: number) => {
            eng.resize();
            eng.renderer.render(eng.scene, eng.camera);
            eng.clock.showStats();
        });
    });
