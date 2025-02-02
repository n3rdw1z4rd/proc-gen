import { Group, MeshPhongMaterial } from 'three';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { rng } from '../utils/rng';
import { World } from './world';
import { log } from '../utils/logger';
import { ThreeJsCameraRig } from '../utils/threejs-camera-rig';

rng.seed = 42;

const PLAYER_SPEED = 32.0;
const ORBIT_SPEED = 0.5;

const eng = new ThreeJsBoilerPlate();
eng.setupBasicScene({ gridHelper: true });
eng.appendTo(document.getElementById('ROOT')!);
// eng.camera.position.y = 5;
// eng.camera.position.z = 10;

// const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

const world = new World({
    // chunkSize?: number;
    // chunkResolution?: number;
    // viewDistance?: number;
    material: new MeshPhongMaterial({ color: 0xff0000, wireframe: true }),
    // octaves?: number;
    // frequency?: number;
    // persistence?: number;
    // amplitude?: number;
});
eng.scene.add(world);

const player = new Group();
const cameraRig = new ThreeJsCameraRig(eng.camera);
player.add(cameraRig);

player.add(ThreeJsBoilerPlate.CreateCubeMesh(0.75, 0xff0000));
player.position.set(world.chunkSize / 2, 0, world.chunkSize / 2);
eng.scene.add(player);

eng.on('mouse_move', (ev: KeyValue) => {
    if (eng.isMouseButtonDown(0)) {
        // gimbal.rotateY(ev.deltaX * eng.clock.deltaTimeSeconds * ORBIT_SPEED);
        // eng.camera.rotateX(ev.deltaY * eng.clock.deltaTimeSeconds * ORBIT_SPEED);
        cameraRig.onMouseMove(ev.deltaX, ev.deltaY);
    }
});

eng.on('mouse_wheel', (ev: KeyValue) => {
    log('mouse_wheel:', ev);
    cameraRig.onMouseWheel(ev.deltaX, ev.deltaY);
});

eng.clock.run((deltaTime: number) => {
    eng.resize();
    // controls.update(deltaTime);

    if (eng.isKeyDown('KeyW')) player.position.z -= (deltaTime * PLAYER_SPEED);
    if (eng.isKeyDown('KeyS')) player.position.z += (deltaTime * PLAYER_SPEED);
    if (eng.isKeyDown('KeyA')) player.position.x -= (deltaTime * PLAYER_SPEED);
    if (eng.isKeyDown('KeyD')) player.position.x += (deltaTime * PLAYER_SPEED);

    world.update(deltaTime, player.position);

    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats({
        player: `${player.position.x.toFixed(2)}, ${player.position.z.toFixed(2)}`,
        button: eng.isMouseButtonDown(0),
    });
});
