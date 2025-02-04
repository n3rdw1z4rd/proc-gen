import { TextureAtlas, TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { Mesh, MeshPhongMaterial, NearestFilter } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ChunkGeometry } from './voxels';

ThreeJsBoilerPlate.LoadTexture('/flourish-cc-by-nc-sa.png')
    .then((textureData: TextureData) => {
        textureData.texture.magFilter = NearestFilter;

        const textureAtlas: TextureAtlas = {
            size: 16,
            textureData
        };

        const chunkMaterial = new MeshPhongMaterial({
            map: textureAtlas.textureData.texture,
            alphaTest: 0.1,
            transparent: true,
        });

        const eng = new ThreeJsBoilerPlate();
        eng.appendTo(document.getElementById('ROOT')!);
        eng.setupBasicScene({
            cameraDistance: 10,
            // gridHelper: false,
        });

        const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

        const chunk = new Mesh(
            new ChunkGeometry(3, textureAtlas),
            chunkMaterial,
        );

        eng.scene.add(chunk);

        // chunk.geometry.setVoxel(0, 0, 0, 1);
        // chunk.geometry.setVoxel(1, 0, 0, 1);
        // chunk.geometry.setVoxel(0, 0, 1, 1);
        
        // chunk.geometry.setVoxel(0, 1, 0, 1);
        // chunk.geometry.setVoxel(1, 1, 0, 1);
        // chunk.geometry.setVoxel(0, 1, 1, 1);

        eng.clock.run((deltaTime: number) => {
            eng.resize();
            controls.update(deltaTime);

            eng.renderer.render(eng.scene, eng.camera);

            eng.clock.showStats();
        });
    });
