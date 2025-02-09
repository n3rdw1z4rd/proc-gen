import { TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
// import { VoxelWorld } from './voxel-world';
import { VoxelMaterial } from '../utils/voxel-material';
import { log } from '../utils/logger';
import { VoxelGeometry } from './voxel-geometry';
import { Mesh } from 'three';

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

        eng.scene.add(ThreeJsBoilerPlate.CreateCubeMesh());

        const voxelMaterial: VoxelMaterial = new VoxelMaterial(textureData, 16, 16);//, { wireframe: true });

        // const chunkSize = 2;
        // const world = new VoxelWorld(chunkSize, chunkSize, voxelMaterial);
        // eng.scene.add(world);
        // world.update([0, 0, 0]);

        const voxelGeometry = new VoxelGeometry({
            // size: 2,
            uvWidth: 16 / voxelMaterial.textureData.width,
            uvHeight: 16 / voxelMaterial.textureData.height,
        });

        voxelGeometry.forEachVoxel(() => rng.nextf > 0.75 ? rng.range(1, 17) : 0);
        voxelGeometry.updateGeometry();

        log('voxelGeometry:', voxelGeometry);

        const chunk = new Mesh(voxelGeometry, voxelMaterial);
        eng.scene.add(chunk);

        eng.clock.run((_dt: number) => {
            eng.resize();
            eng.renderer.render(eng.scene, eng.camera);
            eng.clock.showStats();
        });
    });
