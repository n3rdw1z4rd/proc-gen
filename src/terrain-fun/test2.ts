import { MeshLambertMaterial } from 'three';
import { TerrainMesh } from './terrain-mesh';
import GUI from 'lil-gui';
import { ThreeJsBoilerPlate } from '../core';

const eng = new ThreeJsBoilerPlate({ seed: 42 });
eng.appendTo(document.getElementById('root')!);
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

const noiseParams = {
    octaves: 4,
    persistence: 0.3,
    scale: 0.5,
    amplitude: 0.4,
};

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});

// const update = (_v?: number) => terrain.createGeometry((x: number, _y: number, z: number) => noise(x, z, noiseParams));

// update();

// const gui = new GUI();
// gui.add(noiseParams, 'octaves', 1, 10, 1).onChange(update);
// gui.add(noiseParams, 'frequency', 0.01, 1.0, 0.01).onChange(update);
// gui.add(noiseParams, 'persistence', 0.0, 10.0, 0.01).onChange(update);
// gui.add(noiseParams, 'amplitude', 0.1, 10.0, 0.01).onChange(update);
// gui.add(terrainMaterial, 'wireframe')
