import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { Clock } from '../utils';

export class ThreeJsDevelopmentEnvironment {
    public ambientLight: AmbientLight;
    public camera: PerspectiveCamera;
    public clock: Clock;
    public controls: OrbitControls;
    public directionalLight;
    public renderer: WebGLRenderer;
    public scene: Scene;

    public get canvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    constructor(parentElement: HTMLElement) {
        this.clock = new Clock();

        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.camera = new PerspectiveCamera(75, 2, 0.1, 1000.0);
        this.camera.position.z = 5;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);

        this.ambientLight = new AmbientLight();
        this.directionalLight = new DirectionalLight();

        this.scene = new Scene();
        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLight);

        this.appendTo(parentElement);
    }

    public appendTo(htmlElement?: HTMLElement) {
        if (this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }

        if (htmlElement) {
            htmlElement.appendChild(this.canvas);
            this.resize();
        }
    }

    public resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            this.canvas.parentElement?.getBoundingClientRect() ??
            this.canvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width));
        displayHeight = (0 | (displayHeight ?? height));

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.renderer.setSize(displayWidth, displayHeight);
            this.camera.aspect = displayWidth / displayHeight;
            this.camera.updateProjectionMatrix();

            return true;
        }

        return false;
    }
}
