import { Mesh, MeshLambertMaterial } from 'three';
import GUI from 'lil-gui';
import { CubeSphereGeometry, ThreeJsBoilerPlate } from '@n3rdw1z4rd/core';

const eng = new ThreeJsBoilerPlate({ seed: 42 });

eng.appendTo(document.getElementById('root')!);
eng.setupBasicScene({ gridHelper: false });

const material = new MeshLambertMaterial({
    color: 0x00ff00,
    flatShading: true,
});

const geometry = new CubeSphereGeometry(4, 16);
const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

const noiseParams = {
    octaves: 4,
    persistence: 0.3,
    scale: 0.5,
    amplitude: 0.4,
};

const updateGeometry = () => geometry.applyFractalBrownianMotion(
    noiseParams.octaves,
    noiseParams.persistence,
    noiseParams.scale,
    noiseParams.amplitude,
);

updateGeometry();

const gui = new GUI();
gui.add(material, 'wireframe');
gui.add(noiseParams, 'octaves', 1, 6, 1).onChange(updateGeometry);
gui.add(noiseParams, 'persistence', 0, 1, 0.01).onChange(updateGeometry);
gui.add(noiseParams, 'scale', 0, 1, 0.01).onChange(updateGeometry);
gui.add(noiseParams, 'amplitude', 0, 1, 0.01).onChange(updateGeometry);

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
