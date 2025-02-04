import { TextureData, ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
// import { VoxelWorld } from './voxel-world';
import { BoxGeometry, Mesh, MeshPhongMaterial, NearestFilter } from 'three';
import { VoxelChunk } from './voxel-chunk';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const CHUNK_SIZE = 4;
const PLAYER_SPEED = 1.0;

ThreeJsBoilerPlate.LoadTexture('/flourish-cc-by-nc-sa.png')
    .then((textureData: TextureData) => {
        textureData.texture.magFilter = NearestFilter;

        const eng = new ThreeJsBoilerPlate();
        eng.appendTo(document.getElementById('ROOT')!);
        eng.setupBasicScene({
            cameraDistance: CHUNK_SIZE * 2,
            // gridHelper: false,
        });

        const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

        // const world = new VoxelWorld({
        //     chunkSize: CHUNK_SIZE,
        //     textureData,
        // });

        // eng.scene.add(world);

        const chunk = new VoxelChunk({
            size: CHUNK_SIZE,
            textureData,
            textureSize: 16,
            material: new MeshPhongMaterial({
                map: textureData.texture,
                alphaTest: 0.1,
                transparent: true,
            }),
        });

        chunk.generateVoxels();
        eng.scene.add(chunk);

        const player = new Mesh(
            new BoxGeometry(0.5, 0.5, 0.5),
            new MeshPhongMaterial({ color: 'red' }),
        );

        player.position.set(CHUNK_SIZE / 2, CHUNK_SIZE, CHUNK_SIZE / 2);

        eng.scene.add(player);

        eng.clock.run((deltaTime: number) => {
            eng.resize();
            controls.update(deltaTime);

            if (eng.isKeyDown('KeyW')) player.position.z -= PLAYER_SPEED * deltaTime;
            if (eng.isKeyDown('KeyS')) player.position.z += PLAYER_SPEED * deltaTime;
            if (eng.isKeyDown('KeyA')) player.position.x -= PLAYER_SPEED * deltaTime;
            if (eng.isKeyDown('KeyD')) player.position.x += PLAYER_SPEED * deltaTime;

            chunk.update();

            eng.renderer.render(eng.scene, eng.camera);

            eng.clock.showStats({
                player: player.position.toArray(),
            });
        });
    });
