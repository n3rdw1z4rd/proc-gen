import { TextureAtlas, TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { rng } from '../utils/rng';
import { Mesh, MeshPhongMaterial, NearestFilter } from 'three';
import { ChunkGeometry } from './chunk-geometry';

rng.seed = 42;

ThreeJsBoilerPlate.LoadTexture('/minecraft-atles.png').then((textureData: TextureData) => {
    textureData.texture.magFilter = NearestFilter;

    const textureAtlas: TextureAtlas = new TextureAtlas(textureData, 16);

    const eng = new ThreeJsBoilerPlate();
    eng.appendTo(document.getElementById('ROOT')!);
    eng.setupBasicScene({
        cameraDistance: 5,
        gridHelper: false,
    });

    const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

    const CHUNK_SIZE = 2;
    const chunkGeometry = new ChunkGeometry(CHUNK_SIZE, textureAtlas);

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
