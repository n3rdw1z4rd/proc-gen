import { Group, PerspectiveCamera, Vector3 } from 'three';
import { ThreeJsCameraRig } from './threejs-camera-rig';

export class ThreeJsPlayerController extends Group {
    moveSpeed: number;
    cameraRig: ThreeJsCameraRig;
    velocity: Vector3;

    constructor(camera: PerspectiveCamera) {
        super();

        this.velocity = new Vector3();
        this.cameraRig = new ThreeJsCameraRig(camera);
        this.cameraRig.position.y = 5;
        this.add(this.cameraRig);

        this.moveSpeed = 32;
    }

    update(deltaTime: number) {
        if (this.velocity.length()) {
            this.translateOnAxis(this.velocity.normalize(), this.moveSpeed * deltaTime);
        }
    }
}
