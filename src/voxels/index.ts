import { TextureAtlas, TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { rng } from '../utils/rng';
import { NearestFilter } from 'three';
import { VoxelWorld } from './voxel-world';

rng.seed = 42;

ThreeJsBoilerPlate
    // .LoadTexture('/minecraft-atlas.png')
    .LoadTexture('/flourish-cc-by-nc-sa.png')
    .then((textureData: TextureData) => {
        textureData.texture.magFilter = NearestFilter;

        const textureAtlas: TextureAtlas = new TextureAtlas(textureData, 16);

        const eng = new ThreeJsBoilerPlate();
        eng.appendTo(document.getElementById('ROOT')!);
        eng.setupBasicScene({
            cameraDistance: 25,
            gridHelper: false,
        });

        const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

        const world = new VoxelWorld(textureAtlas, 3);
        eng.scene.add(world);

        eng.clock.run((dt: number) => {
            eng.resize();
            controls.update(dt);
            world.update([0, 0, 0]);
            eng.renderer.render(eng.scene, eng.camera);
            eng.clock.showStats();
        });
    });
