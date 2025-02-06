import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { rng } from '../utils/rng';
import { CameraRig } from './camera-rig';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    // cameraDistance: 25,
    // gridHelper: false,
});

eng.scene.add(ThreeJsBoilerPlate.CreateCubeMesh());

// const controls = new OrbitControls(eng.camera, eng.renderer.domElement);
const camera = new CameraRig(eng.camera);

eng.clock.run((dt: number) => {
    eng.resize();
    // controls.update(dt);
    camera.update(dt);
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
