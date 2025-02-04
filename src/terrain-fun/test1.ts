import { MeshPhongMaterial, Object3D } from 'three';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { World, WorldParams } from './world';
import { ThreeJsPlayerController } from '../utils/threejs-player-controller';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);

const worldParams: WorldParams = {
    chunkSize: 64,
    // chunkResolution: 2,
    // viewDistance: 150,
    material: new MeshPhongMaterial({ color: 0xff0000, wireframe: true }),
    // octaves:  4,
    // frequency:  0.5,
    // persistence:  0.5,
    // amplitude:  1.0,
};

const world = new World(worldParams);
eng.scene.add(world);

const player = new ThreeJsPlayerController(eng.camera);
// player.position.set(50, 0, 50);
// player.position.set(16.2, 0, 10);
// player.position.set(world.chunkSize / 2, 0, world.chunkSize / 2);
player.moveSpeed = world.chunkSize / 4;
eng.scene.add(player);

player.add(ThreeJsBoilerPlate.CreateCubeMesh());

eng.on('mouse_move', (ev: KeyValue) => {
    if (eng.isMouseButtonDown(0)) {
        player.cameraRig.onMouseMove(ev.deltaX, ev.deltaY);
    }
});

eng.on('mouse_wheel', (ev: KeyValue) => {
    player.cameraRig.onMouseWheel(ev.deltaX, ev.deltaY);
});

let picked: Object3D | null = null;

eng.on('mouse_button_clicked', (ev: KeyValue) => {
    if (ev.button === 0) {
        picked = eng.pick()?.object ?? null;
    }
});

eng.setupBasicScene({ gridHelper: false });

const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

eng.clock.run((deltaTime: number) => {
    eng.resize();
    controls.update(deltaTime);

    player.velocity.x = (eng.getKeyState('KeyD') - eng.getKeyState('KeyA'))
    player.velocity.z = (eng.getKeyState('KeyS') - eng.getKeyState('KeyW'));
    player.update(deltaTime);

    world.update(deltaTime, player.position);

    eng.renderer.render(eng.scene, eng.camera);

    eng.clock.showStats({
        chunkSize: world.chunkSize,
        chunkResolution: world.chunkResolution,
        viewDistance: world.viewDistance,
        stepAmount: world.generateStepAmount,
        player: `${player.position.x.toFixed(2)}, ${player.position.z.toFixed(2)}`,
        picked: picked?.name ?? null,
    });
});
