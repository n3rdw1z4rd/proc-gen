import { Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';
import { rng } from '../utils/rng';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { NoiseParams } from '../utils/noise';
import { ApplyNoise } from './geometry-noise';
import GUI from 'lil-gui';

const SIZE = 20;
const SEGMENTS = 100;

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    cameraDistance: 20,
    gridHelper: false,
});

const material = new MeshLambertMaterial({
    color: 0x00ff00,
    // flatShading: true,
    // vertexColors: true,
    wireframe: true,
});

const noiseParams: NoiseParams = {
    octaves: 4,
    frequency: 0.05,
    persistence: 0.5,
    amplitude: 4,
};

const geometry = new PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
geometry.rotateX(Math.PI * -0.5);

ApplyNoise(geometry, noiseParams);

const gui = new GUI();
gui.add(material, 'wireframe');
gui.add(noiseParams, 'octaves', 1, 8, 1).onChange(() => ApplyNoise(geometry, noiseParams));
gui.add(noiseParams, 'frequency', 0.01, 1.0, 0.01).onChange(() => ApplyNoise(geometry, noiseParams));
gui.add(noiseParams, 'persistence', 0.1, 1.0, 0.1).onChange(() => ApplyNoise(geometry, noiseParams));
gui.add(noiseParams, 'amplitude', 0.1, 8, 0.1).onChange(() => ApplyNoise(geometry, noiseParams));

const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
