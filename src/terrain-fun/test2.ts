import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { TerrainGeometry } from './terrain-geometry';
import { Mesh, MeshPhongMaterial } from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);

eng.setupBasicScene({
    cameraDistance: 25,
    gridHelper: false,
});

const controls = new OrbitControls(eng.camera, eng.renderer.domElement);

const terrainGeometry = new TerrainGeometry(20, 20, {
    // octaves: 3,
    // frequency: 0.01,
    // persistence: 3,
    // amplitude: 1,
});

const terrain = new Mesh(
    terrainGeometry,
    new MeshPhongMaterial({
        color: 0x00aa00,
        // flatShading: true,
        wireframe: true,
    }),
);

eng.scene.add(terrain);

eng.clock.run((dt: number) => {
    eng.resize();
    controls.update(dt);
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
})

const gui = new GUI();
gui.add(terrainGeometry, 'octaves', 1, 10, 1);
gui.add(terrainGeometry, 'frequency', 0.01, 1.0, 0.01);
gui.add(terrainGeometry, 'persistence', 0.0, 10.0, 0.01);
gui.add(terrainGeometry, 'amplitude', 0.1, 10.0, 0.01);
