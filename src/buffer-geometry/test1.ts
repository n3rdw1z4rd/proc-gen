import { Mesh, MeshLambertMaterial } from 'three';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { CubeSphereGeometry } from './cube-sphere-geometry';
import GUI from 'lil-gui';
import { FractalParams } from '../utils/perlin-noise';

const eng = new ThreeJsBoilerPlate();//({ seed: 42 });

eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    // cameraDistance: 25,
    // gridHelper: false,
});

const material = new MeshLambertMaterial({
    color: 0x00ff00,
    flatShading: true,
    // vertexColors: true,
    wireframe: true,
});

const size = 4;
const segments = 16;
const scale = 0.5;

const geometry = new CubeSphereGeometry(size, segments);

const fractalParams: FractalParams = {
    octaves: 2,
    frequency: 0.2,
    persistence: 0.3,
    amplitude: 1,
    lacunarity: 2.2,
    // octaves: 0,
    // frequency: 0,
    // persistence: 0,
    // amplitude: 0,
    // lacunarity: 0,
};

const updateGeometry = () => {
    // geometry.applyNoise(scale);
    geometry.applyNoise(scale, fractalParams);
};
updateGeometry();

const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

const gui = new GUI();
gui.add(fractalParams, 'octaves', 0, 8, 1).onChange(updateGeometry);
gui.add(fractalParams, 'frequency', 0, 1.0, 0.01).onChange(updateGeometry);
gui.add(fractalParams, 'persistence', 0, 1.0, 0.1).onChange(updateGeometry);
gui.add(fractalParams, 'amplitude', 0, 8, 0.1).onChange(updateGeometry);
gui.add(fractalParams, 'lacunarity', 0, 8, 0.1).onChange(updateGeometry);
gui.add(material, 'wireframe');

eng.clock.run((_dt: number) => {
    eng.resize();

    mesh.rotateX(0.5 * _dt);
    mesh.rotateY(-0.75 * _dt);
    mesh.rotateZ(-0.5 * _dt);

    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
