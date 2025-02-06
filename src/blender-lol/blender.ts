import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';
import { Emitter } from '../utils/emitter';
import GUI from 'lil-gui';
import { Object3D } from 'three';
import { log } from '../utils/logger';

class GuiHelper extends GUI {
    private _inspectFolder: GUI | undefined;

    constructor() {
        super();

        this.hide();
    }

    inspectObect(obj: Object3D | null) {
        log('inspectObj:', obj);

        this._inspectFolder?.destroy();

        if (obj) {
            this._inspectFolder = this.addFolder(`${obj.name ?? 'unnamed'} [${obj.type}]`);

            const posFolder = this._inspectFolder.addFolder('Position');
            posFolder.add(obj.position, 'x');
            posFolder.add(obj.position, 'y');
            posFolder.add(obj.position, 'z');

            const rotFolder = this._inspectFolder.addFolder('Rotation');
            rotFolder.add(obj.rotation, 'x');
            rotFolder.add(obj.rotation, 'y');
            rotFolder.add(obj.rotation, 'z');

            this.show();
        } else this.hide();
    }
}

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);
eng.setupBasicScene({
    gridHelper: false,
});

const gui = new GuiHelper();

const cube = ThreeJsBoilerPlate.CreateCubeMesh();
eng.scene.add(cube);

Emitter.instance.on('mouse_button_clicked', (ev: KeyValue) => {
    if (ev.button === 0) {
        const picked = eng.pick();

        if (picked) {
            gui.inspectObect(picked.object);
        } else {
            gui.inspectObect(null);
        }
    }
});

eng.clock.run((_dt: number) => {
    eng.resize();
    eng.renderer.render(eng.scene, eng.camera);
    eng.clock.showStats();
});
