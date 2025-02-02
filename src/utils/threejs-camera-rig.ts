import { PerspectiveCamera, Group } from 'three';
import { clamp, deg2rad } from './math';

export class ThreeJsCameraRig extends Group {
    gimbal: Group;
    camera: PerspectiveCamera;

    mouseSensitivity: number = 0.01;
    wheelSensitivity: number = 0.02;

    minCameraDistance: number = 0.1;
    maxCameraDistance: number = 50.0;

    min_angle: number = deg2rad(-90);
    max_angle: number = deg2rad(0);

    constructor(camera?: PerspectiveCamera) {
        super();

        this.gimbal = new Group();
        this.add(this.gimbal);

        this.camera = camera ?? new PerspectiveCamera(70, 1, 0.1, 1000);
        this.camera.position.z = 5;
        this.gimbal.add(this.camera);
    }

    onMouseMove(dx: number, dy: number) {
        (this.parent || this).rotateY(-dx * this.mouseSensitivity);

        this.gimbal.rotation.x = clamp(
            this.gimbal.rotation.x + (-dy * this.mouseSensitivity),
            this.min_angle,
            this.max_angle
        );
    }

    onMouseWheel(_dx: number, dy: number) {
        this.camera.position.z = clamp(
            this.camera.position.z + (dy * this.wheelSensitivity),
            this.minCameraDistance,
            this.maxCameraDistance
        );
    }
}
