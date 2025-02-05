import { TextureAtlas, TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { rng } from '../utils/rng';
import { Mesh, MeshPhongMaterial, NearestFilter } from 'three';
import { ChunkGeometry } from './chunk-geometry';
import { SimplexNoise } from '../utils/simplex-noise';
import { log } from '../utils/logger';

rng.seed = 42;

ThreeJsBoilerPlate.LoadTexture('/minecraft-atles.png').then((textureData: TextureData) => {
    textureData.texture.magFilter = NearestFilter;

    const textureAtlas: TextureAtlas = new TextureAtlas(textureData, 16);

    const eng = new ThreeJsBoilerPlate();
    eng.appendTo(document.getElementById('ROOT')!);
    eng.setupBasicScene({
        cameraDistance: 25,
        gridHelper: false,
    });

    const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

    const chunkGeometry = new ChunkGeometry(textureAtlas);

    const noise = new SimplexNoise();

    for (let x = 0; x < chunkGeometry.size; ++x) {
        for (let y = 0; y < chunkGeometry.height; ++y) {
            for (let z = 0; z < chunkGeometry.size; ++z) {
                const h = noise.fractalNoise2d(
                    x / chunkGeometry.size,
                    z / chunkGeometry.size,
                    4, // octaves
                    0.1, // frequency
                    0.4, // persistence
                    2, // amplitude
                );

                if (y < h * chunkGeometry.height) chunkGeometry.set([x, y, z], 1, false);
            }
        }
    }

    log(`updateGeometry time: ${chunkGeometry.updateGeometry()}ms`);

    eng.scene.add(new Mesh(
        chunkGeometry,
        new MeshPhongMaterial({
            map: textureData.texture,
            alphaTest: 0.1,
            transparent: true,
        }),
    ));

    eng.clock.run((dt: number) => {
        eng.resize();
        controls.update(dt);
        eng.renderer.render(eng.scene, eng.camera);
        eng.clock.showStats();
    });
});
