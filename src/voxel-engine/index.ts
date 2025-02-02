import { AmbientLight, DirectionalLight, GridHelper, Intersection, Mesh, MeshPhongMaterial, NearestFilter, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
// import { World } from './voxel-world';
import { log, logerr } from '../utils/logger';
// import { BLOCKS } from './constants';
import { Chunk, World } from './world';

ThreeJsBoilerPlate.LoadTexture('/flourish-cc-by-nc-sa.png')
    .then((textureData: KeyValue) => {
        rng.seed = 42;

        const eng = new ThreeJsBoilerPlate();
        eng.appendTo(document.getElementById('ROOT')!);

        eng.camera.position.z = 20;

        eng.scene.add(new AmbientLight());
        eng.scene.add(new DirectionalLight());
        eng.scene.add(new GridHelper(100, 100));
        // eng.scene.add(ThreeJsBoilerPlate.CreateCubeMesh());

        const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

        // const world = new World('/flourish-cc-by-nc-sa.png');
        // eng.scene.add(world);



        // let picked: Intersection | null = null;

        // eng.on('mouse_button_pressed', (data: KeyValue) => {
        //     if (data.button === 0) {
        //         picked = eng.pick();

        //         if (picked?.object?.type === 'Mesh') {
        //             const object = picked.object as Mesh;
        //             const point = picked.point.toArray();
        //             const voxel = world.getVoxel(point);

        //             log('pick:', { point, voxel, picked, name: BLOCKS[voxel] ?? 'unknown' });

        //             // log('MESH:', object.geometry);
        //             const testCube = ThreeJsBoilerPlate.CreateCubeMesh(0.25);
        //             testCube.position.set(...point);
        //             world.add(testCube);
        //         }
        //     }
        // });

        const { texture, textureWidth, textureHeight } = textureData;

        texture.magFilter = NearestFilter;

        const material = new MeshPhongMaterial({
            map: texture,
            alphaTest: 0.1,
            transparent: true,
        });

        const chunk = new Chunk({
            size: 2,
            textureWidth,
            textureHeight,
            textureSize: 16,
            material,
        });

        chunk.name = 'CHUNK';
        log('chunk:', chunk);
        eng.scene.add(chunk);

        // const world = new World({
        //     size: 2,
        //     textureWidth,
        //     textureHeight,
        //     textureSize: 16,
        //     material,
        // });

        // eng.scene.add(world);

        // log('world.getVoxel([0, 0, 0]):', world.getVoxel([0, 0, 0]));

        // const playerPosition = new Vector3(world.size / 2, 0, world.size / 2);

        eng.clock.run((deltaTime: number) => {
            eng.resize();

            controls.update(deltaTime);

            // world.update(deltaTime, playerPosition);

            eng.renderer.render(eng.scene, eng.camera);

            eng.clock.showStats({
                // chunks: world.chunkCount,
                // player: playerPosition.toArray(),
                mouse: eng.mousePosition,
                // picked: picked?.object?.name,
            });
        });
    })
    .catch(logerr);