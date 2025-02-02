import { MeshPhongMaterial } from 'three';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { World } from './world';
import { ThreeJsPlayerController } from '../utils/threejs-player-controller';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.setupBasicScene({ gridHelper: true });
eng.appendTo(document.getElementById('ROOT')!);

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

const player = new ThreeJsPlayerController(eng.camera);

eng.scene.add(player);

eng.on('mouse_move', (ev: KeyValue) => {
    if (eng.isMouseButtonDown(0)) {
        player.cameraRig.onMouseMove(ev.deltaX, ev.deltaY);
    }
});

eng.on('mouse_wheel', (ev: KeyValue) => {
    player.cameraRig.onMouseWheel(ev.deltaX, ev.deltaY);
});

eng.clock.run((deltaTime: number) => {
    eng.resize();

    player.velocity.x = (eng.getKeyState('KeyD') - eng.getKeyState('KeyA'))
    player.velocity.z = (eng.getKeyState('KeyS') - eng.getKeyState('KeyW'));
    player.update(deltaTime);

    world.update(deltaTime, player.position);

    eng.renderer.render(eng.scene, eng.camera);

    eng.clock.showStats({
        player: `${player.position.x.toFixed(2)}, ${player.position.z.toFixed(2)}`,
        button: eng.isMouseButtonDown(0),
    });
});
