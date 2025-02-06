import { Group, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { Input } from '../utils/input';
import { log } from '../utils/logger';

export class CameraRig extends Group {
    constructor(camera: PerspectiveCamera) {
        super();

        Input.GlobalInstance
            .on('mouse_move', this._onMouseMove.bind(this));
    }

    private _onMouseMove(ev: KeyValue) {
        const { deltaX, deltaY } = ev;

        
    }

    update(deltaTime: number) {

    }
}
