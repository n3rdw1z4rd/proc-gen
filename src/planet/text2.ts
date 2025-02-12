import { Mesh, MeshLambertMaterial } from 'three';
import { rng } from '../utils/rng';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { FractalParams } from '../utils/perlin-noise';
import { SphericalBoxGeometry } from './spherical-box-geometry';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    cameraDistance: 5,
    // gridHelper: false,
});

const material = new MeshLambertMaterial({
    color: 0x00ff00,
    flatShading: true,
    // vertexColors: true,
    wireframe: true,
});

const geometry = new SphericalBoxGeometry(2, 8);
const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

const fractalParams: FractalParams = {
    octaves: 5,
    frequency: 1.0,
    persistence: 0.5,
    amplitude: 0.3,
    lacunarity: 2.2,
};

// geometry.addFractalNoiseControls(fractalParams, material);

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
