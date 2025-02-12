import { Mesh, MeshLambertMaterial } from 'three';
import { rng } from '../utils/rng';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { FractalParams } from '../utils/perlin-noise';
import { SphericalBoxGeometry } from './spherical-box-geometry';
import GUI from 'lil-gui';

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

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});

// const updateGeometry = () => geometry.applyFractalNoise(fractalParams);
// updateGeometry();

// const gui = new GUI();
// gui.add(fractalParams, 'octaves', 1, 8, 1).onChange(updateGeometry);
// gui.add(fractalParams, 'frequency', 0.01, 1.0, 0.01).onChange(updateGeometry);
// gui.add(fractalParams, 'persistence', 0.1, 1.0, 0.1).onChange(updateGeometry);
// gui.add(fractalParams, 'amplitude', 0.1, 8, 0.1).onChange(updateGeometry);
// gui.add(fractalParams, 'lacunarity', 0.1, 8, 0.1).onChange(updateGeometry);
// gui.add(material, 'wireframe');
