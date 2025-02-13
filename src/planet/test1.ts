import { BoxGeometry, Mesh, MeshLambertMaterial, Vector3 } from 'three';
import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { noise, FractalParams } from '../utils/perlin-noise';

function applyNoise(
    geometry: BoxGeometry,
    fractalParams: FractalParams,
): void {
    const position = geometry.attributes.position;
    const vertex = new Vector3();

    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        // vertex.normalize();

        const n = noise(vertex.x, vertex.y, vertex.z, fractalParams);

        vertex.addScalar(n);
        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
}

const eng = new ThreeJsBoilerPlate({ seed: 42 });
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    cameraDistance: 5,
    // directionalLight: false,
    // gridHelper: false,
});

const material = new MeshLambertMaterial({
    // color: 0x00ff00,
    // side: DoubleSide,
    flatShading: true,
    // vertexColors: true,
    // wireframe: true,
});

const fractalParams: FractalParams = {
    octaves: 1,
    frequency: 0.05,
    persistence: 0.5,
    amplitude: 1,
};

const size = 2;
const segments = 8;
const geometry = ThreeJsBoilerPlate.CreateSphericalBoxGeometry(size, segments);



const mesh = new Mesh(geometry, material);
eng.scene.add(mesh);

const updateGeometry = () => {
    applyNoise(geometry, fractalParams);
}

updateGeometry();

// const gui = new GUI();
// gui.add(material, 'wireframe');
// gui.add(fractalParams, 'octaves', 1, 8, 1).onChange(updateGeometry);
// gui.add(fractalParams, 'frequency', 0.01, 1.0, 0.01).onChange(updateGeometry);
// gui.add(fractalParams, 'persistence', 0.1, 1.0, 0.1).onChange(updateGeometry);
// gui.add(fractalParams, 'amplitude', 0.1, 8, 0.1).onChange(updateGeometry);

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
