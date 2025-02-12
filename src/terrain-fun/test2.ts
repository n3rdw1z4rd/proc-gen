import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { MeshLambertMaterial } from 'three';
import { TerrainMesh } from './terrain-mesh';
import GUI from 'lil-gui';
import { noise, FractalParams } from '../utils/perlin-noise';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    cameraDistance: 5,
    gridHelper: false,
});

const terrainMaterial = new MeshLambertMaterial({
    // color: 0x00ff00,
    flatShading: true,
    vertexColors: true,
    // wireframe: true,
});

const terrain = new TerrainMesh(20, 100, terrainMaterial);
terrain.minColor = 0.1;
eng.scene.add(terrain);

const fractalParams: FractalParams = {
    octaves: 2,
    frequency: 0.2,
    persistence: 0.3,
    amplitude: 1,
    lacunarity: 2.2,
};


eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});

const update = (_v?: number) => terrain.createGeometry((x: number, _y: number, z: number) => noise(x, z, fractalParams));

update();

const gui = new GUI();
gui.add(fractalParams, 'octaves', 1, 10, 1).onChange(update);
gui.add(fractalParams, 'frequency', 0.01, 1.0, 0.01).onChange(update);
gui.add(fractalParams, 'persistence', 0.0, 10.0, 0.01).onChange(update);
gui.add(fractalParams, 'amplitude', 0.1, 10.0, 0.01).onChange(update);
gui.add(terrainMaterial, 'wireframe')
