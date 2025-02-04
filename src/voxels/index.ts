import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { TextureAtlas, TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { NearestFilter } from 'three';
import { ChunkMesh } from './voxel-geometry';
import { rng } from '../utils/rng';

ThreeJsBoilerPlate.LoadTexture('/flourish-cc-by-nc-sa.png')
    .then((textureData: TextureData) => {
        rng.seed = 42;

        const eng = new ThreeJsBoilerPlate();
        eng.appendTo(document.getElementById('ROOT')!);
        eng.setupBasicScene({
            cameraDistance: 5,
        });

        const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

        textureData.texture.magFilter = NearestFilter;

        const textureAtlas: TextureAtlas = {
            textureSize: 16,
            textureData,
        };

        const chunk = new ChunkMesh(2, textureAtlas);
        eng.scene.add(chunk);

        // chunk.setVoxel(0, 0, 0, 1);

        eng.clock.run((dt: number) => {
            eng.resize();
            controls.update(dt);
            eng.renderer.render(eng.scene, eng.camera);
            eng.clock.showStats();
        });
    });
