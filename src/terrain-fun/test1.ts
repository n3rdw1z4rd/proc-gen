import { Emitter } from '../utils/emitter';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { Intersection, Mesh, MeshLambertMaterial } from 'three';
import { World } from './world';
import { rng } from '../utils/rng';
import { FractalNoiseParams } from '../utils/noise';
import GUI from 'lil-gui';
import { log } from '../utils/logger';

rng.seed = 42;

const emitter = Emitter.instance;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);

const material = new MeshLambertMaterial({
    // color: 0x00aa00,
    flatShading: true,
    vertexColors: true,
    // wireframe: true,
});

const noiseParams: FractalNoiseParams = {
    octaves: 3,
    frequency: 0.05,
    persistence: 0.5,
    amplitude: 4,
};

const world = new World(4, 10, material, noiseParams);
eng.scene.add(world);

let picked: Intersection | null = null;

emitter.on('mouse_button_clicked', (ev: KeyValue) => {
    if (ev.button === 0) {
        picked = eng.pick();
        if (picked) {
            log('picked:', picked);

            const faceIndex = Math.floor((picked.faceIndex ?? 0) / 2);
            const obj = picked.object as Mesh;

            // (obj.geometry as PlaneGeometry).

            // var index = Math.floor(intersects[0].faceIndex / 2);
            // cubeGeometry.faces[index].color.setHex(0xff000);
        }
    }
});

eng.setupBasicScene({ gridHelper: false });

eng.clock.run((deltaTime: number) => {
    eng.resize();

    world.update(deltaTime);

    eng.renderer.render(eng.scene, eng.camera);

    eng.clock.showStats({
        chunkSize: world.chunkSize,
        chunkResolution: world.chunkResolution,
        viewDistance: world.viewDistance,
        stepAmount: world.generateStepAmount,
        picked: picked?.object.name ?? null,
    });
});

const update = () => world.updateNoise(noiseParams);

const gui = new GUI();
// gui.add(terrainGeometry, 'size', 1, 10, 1);
// gui.add(terrainGeometry, 'segments', 1, 10, 1);
gui.add(noiseParams, 'octaves', 1, 10, 1).onChange(update);
gui.add(noiseParams, 'frequency', 0.01, 1.0, 0.01).onChange(update);
gui.add(noiseParams, 'persistence', 0.0, 10.0, 0.01).onChange(update);
gui.add(noiseParams, 'amplitude', 0.1, 10.0, 0.01).onChange(update);
