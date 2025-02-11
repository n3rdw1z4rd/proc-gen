import { Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';
import { rng } from '../utils/rng';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { createFractalNoise2D, FractalNoiseParams } from '../utils/noise';
import { AddNoise } from './geometry-noise';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    cameraDistance: 5,
    // gridHelper: false,
});

const noise = createFractalNoise2D();

const material = new MeshLambertMaterial({
    color: 0x00ff00,
    // flatShading: true,
    // vertexColors: true,
    wireframe: true,
});

const fractalParams: FractalNoiseParams = {
    octaves: 3,
    frequency: 0.05,
    persistence: 0.5,
    amplitude: 4,
};

const geometry = new PlaneGeometry(2, 2, 2, 2);
geometry.rotateX(Math.PI * -0.5);

// AddNoise(geometry, {});

const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
