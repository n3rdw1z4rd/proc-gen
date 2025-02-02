import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { World } from './world';
import { Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';

rng.seed = 42;

const PLAYER_SPEED = 2.0;

const eng = new ThreeJsBoilerPlate();
eng.setupBasicScene({ gridHelper: true });
eng.appendTo(document.getElementById('ROOT')!);
eng.camera.position.y = 5;
eng.camera.position.z = 10;

const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

const playerPlane = new Mesh(
    new PlaneGeometry(10, 10, 1, 1),
    new MeshLambertMaterial({ color: 0x00ffff }),
);

playerPlane.rotateX(Math.PI * -0.5);

const player = ThreeJsBoilerPlate.CreateCubeMesh(0.75, 0xff0000);
player.add(playerPlane);
player.position.set(5, 0, 5);
eng.scene.add(player);

const world = new World();
eng.scene.add(world);

eng.clock.run((deltaTime: number) => {
    eng.resize();
    controls.update(deltaTime);

    if (eng.isKeyDown('KeyW')) player.position.z -= (deltaTime * PLAYER_SPEED);
    if (eng.isKeyDown('KeyS')) player.position.z += (deltaTime * PLAYER_SPEED);
    if (eng.isKeyDown('KeyA')) player.position.x -= (deltaTime * PLAYER_SPEED);
    if (eng.isKeyDown('KeyD')) player.position.x += (deltaTime * PLAYER_SPEED);

    world.update(deltaTime, player.position);

    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats({
        player: `${player.position.x.toFixed(2)}, ${player.position.z.toFixed(2)}`,
    });
});
