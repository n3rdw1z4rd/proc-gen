import { PerspectiveCamera, Scene, WebGLRenderer, WebGLRendererParameters } from 'three';
import { Clock } from './clock';
import { Emitter } from './emitter';

export interface ThreeJsBoilerPlateParams {
    parentElement?: HTMLElement,
    renderer?: WebGLRendererParameters,
    camera?: {
        fov?: number,
        aspect?: number,
        near?: number,
        far?: number,
    }
}

export class ThreeJsBoilerPlate extends Emitter {
    public clock: Clock;
    public renderer: WebGLRenderer;
    public camera: PerspectiveCamera;
    public scene: Scene;

    public get canvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    constructor(params?: ThreeJsBoilerPlateParams) {
        super();

        this.clock = new Clock();

        this.renderer = new WebGLRenderer(params?.renderer);

        this.camera = new PerspectiveCamera(
            params?.camera?.fov ?? 75,
            params?.camera?.aspect ?? 2,
            params?.camera?.near ?? 0.1,
            params?.camera?.far ?? 1000.0,
        );

        this.scene = new Scene();

        if (params?.parentElement) {
            this.appendTo(params.parentElement);
        }
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

        let resized: boolean = false;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.renderer.setSize(displayWidth, displayHeight);
            this.camera.aspect = displayWidth / displayHeight;
            this.camera.updateProjectionMatrix();

            resized = true;
        }

        return resized;
    }
}
