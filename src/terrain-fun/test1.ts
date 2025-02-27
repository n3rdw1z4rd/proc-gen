import { Intersection, Mesh, MeshLambertMaterial } from 'three';
import { World } from './world';
import { FractalParams, TextureAtlas, ThreeJsBoilerPlate } from '@n3rdw1z4rd/core';
import GUI from 'lil-gui';

// const URL = '/minecraft-atlas.png';
const URL = '/flourish-cc-by-nc-sa.png';
const TEXTURE_WIDTH = 16;

TextureAtlas.CreateFromUrl(
    URL,
    TEXTURE_WIDTH,
    TEXTURE_WIDTH,
    {
        // wireframe: true
        vertexColors: true,
    },
).then((textureAtlas: TextureAtlas) => {
    const eng = new ThreeJsBoilerPlate({ seed: 42 });
    eng.appendTo(document.getElementById('root')!);

    const material = new MeshLambertMaterial({
        // color: 0x00aa00,
        flatShading: true,
        vertexColors: true,
        // wireframe: true,
    });

    const fractalParams: FractalParams = {
        octaves: 2,
        frequency: 0.2,
        persistence: 0.3,
        amplitude: 1,
        lacunarity: 2.2,
    };

    // const world = new World(4, 10, material, fractalParams);
    const world = new World(4, 1, textureAtlas, fractalParams);
    eng.scene.add(world);

    // let picked: Intersection | null = null;

    // emitter.on('mouse_button_clicked', (ev: KeyValue) => {
    //     if (ev.button === 0) {
    //         picked = eng.pick();
    //         if (picked) {
    //             log('picked:', picked);

    //             const faceIndex = Math.floor((picked.faceIndex ?? 0) / 2);
    //             const obj = picked.object as Mesh;

    //             // (obj.geometry as PlaneGeometry).

    //             // var index = Math.floor(intersects[0].faceIndex / 2);
    //             // cubeGeometry.faces[index].color.setHex(0xff000);
    //         }
    //     }
    // });

    eng.setupBasicScene({ gridHelper: false });

    eng.clock.run((deltaTime: number) => {
        eng.resize();

        world.update(deltaTime);

        eng.renderer.render(eng.scene, eng.camera);

        eng.clock.showStats({
            chunkSize: world.chunkSize,
            chunkResolution: world.chunkResolution,
            viewDistance: world.viewDistance,
            stepAmount: world.generateStepAmount,
            // picked: picked?.object.name ?? null,
        });
    });

    // const update = () => world.updateNoise(fractalParams);

    // const gui = new GUI();
    // gui.add(terrainGeometry, 'size', 1, 10, 1);
    // gui.add(terrainGeometry, 'segments', 1, 10, 1);
    // gui.add(fractalParams, 'octaves', 1, 10, 1).onChange(update);
    // gui.add(fractalParams, 'frequency', 0.01, 1.0, 0.01).onChange(update);
    // gui.add(fractalParams, 'persistence', 0.0, 10.0, 0.01).onChange(update);
    // gui.add(fractalParams, 'amplitude', 0.1, 10.0, 0.01).onChange(update);

});
