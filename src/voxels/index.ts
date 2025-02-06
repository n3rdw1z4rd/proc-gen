import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { NearestFilter } from 'three';
import { World } from './world';
import { TextureAtlas, TextureData } from '../utils/texture-atlas';
import { log } from '../utils/logger';

log('voxels');

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

        const world = new World(textureAtlas, 3);
        eng.scene.add(world);

        eng.clock.run((dt: number) => {
            eng.resize();
            world.update([0, 0, 0]);
            eng.renderer.render(eng.scene, eng.camera);
            eng.clock.showStats();
        });
    });
