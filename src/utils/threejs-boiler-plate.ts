import { BoxGeometry, ColorRepresentation, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer, WebGLRendererParameters } from 'three';
import { Clock } from './clock';
import { Emitter } from './emitter';
import { Input } from './input';

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
    public input: Input;

    private _pickingEnabled: boolean = false;
    public raycaster: Raycaster;
    public pickMousePosition: Vector2 = new Vector2();
    // public picked: Object3D | null = null;

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

        this.input = new Input();

        this.raycaster = new Raycaster();
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

    // private _handleMouseMove(event: MouseEvent) {
    //     const rect = this.renderer.domElement.getBoundingClientRect();

    //     const x = (event.clientX - rect.left) * this.renderer.domElement.width / rect.width;
    //     const y = (event.clientY - rect.top) * this.renderer.domElement.height / rect.height;

    //     this.pickMousePosition.x = (x / this.renderer.domElement.width) * 2 - 1;
    //     this.pickMousePosition.y = (y / this.renderer.domElement.width) * -2 + 1;
    // }

    // public enablePicking() {
    //     window.addEventListener('mousemove', this._handleMouseMove.bind(this));
    //     this._pickingEnabled = true;
    // }

    // public disablePicking() {
    //     window.removeEventListener('mousemove', this._handleMouseMove.bind(this));
    //     this._pickingEnabled = false;
    // }

    public pick(mousePosition: [number, number]): Object3D | null {
        const pickX = (mousePosition[0] / this.renderer.domElement.width) * 2 - 1;
        const pickY = (mousePosition[1] / this.renderer.domElement.height) * -2 + 1;  // note we flip Y

        let obj: Object3D | null = null;

        this.raycaster.setFromCamera(new Vector2(pickX, pickY), this.camera);

        const intersected = this.raycaster.intersectObjects(this.scene.children);

        if (intersected.length) {
            obj = intersected[0].object;
        }

        return obj;
    }

    public static CreateCubeMesh(size: number = 1, color: ColorRepresentation = 0xff0000): Mesh {
        return new Mesh(
            new BoxGeometry(size, size, size),
            new MeshBasicMaterial({ color }),
        );
    }
}
