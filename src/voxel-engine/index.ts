import { AmbientLight, DirectionalLight, GridHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { World } from './voxel-world';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);

eng.camera.position.z = 20;

eng.scene.add(new AmbientLight());
eng.scene.add(new DirectionalLight());
eng.scene.add(new GridHelper(100, 100));

const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

const world = new World('/flourish-cc-by-nc-sa.png');
eng.scene.add(world);

eng.clock.run((deltaTime: number) => {
    eng.resize();
    controls.update(deltaTime);
    world.update(deltaTime, [0, 0, 0]);
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats({});
});
