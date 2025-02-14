import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { ApplyNoise, ApplyNoiseOg, CubeSphereGeometry, NormalizeVertices } from './utils';
import GUI from 'lil-gui';

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

const settings = {
    fractalParams: {
        octaves: 2,
        frequency: 0.2,
        persistence: 0.3,
        amplitude: 1,
        lacunarity: 2.2,
    },
    scale: 1.0,
    material,
}

const updateGeometry = () => {
    // ApplyNoise(geometry, settings.scale, settings.fractalParams);
    // ApplyNoiseOg(geometry, settings.scale, settings.fractalParams);
}

const size = 4;
const segs = 4;

// const geometry = new BoxGeometry(size, size, size, segs, segs, segs);
const geometry = new CubeSphereGeometry(size, segs);
geometry.applyNoise();

// NormalizeVertices(geometry);
// updateGeometry();

const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

// const gui = new GUI();
// gui.add(settings.fractalParams, 'octaves', 1, 8, 1).onChange(updateGeometry);
// gui.add(settings.fractalParams, 'frequency', 0.01, 1.0, 0.01).onChange(updateGeometry);
// gui.add(settings.fractalParams, 'persistence', 0.1, 1.0, 0.1).onChange(updateGeometry);
// gui.add(settings.fractalParams, 'amplitude', 0.1, 8, 0.1).onChange(updateGeometry);
// gui.add(settings.fractalParams, 'lacunarity', 0.1, 8, 0.1).onChange(updateGeometry);
// gui.add(settings, 'scale', 0.1, 2.0, 0.1).onChange(updateGeometry);
// gui.add(settings.material, 'wireframe');

eng.clock.run((_dt: number) => {
    eng.resize();

    mesh.rotateX(0.5 * _dt);
    mesh.rotateY(-0.75 * _dt);
    mesh.rotateZ(-0.5 * _dt);

    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
