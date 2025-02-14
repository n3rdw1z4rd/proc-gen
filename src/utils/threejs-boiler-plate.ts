import { AmbientLight, BoxGeometry, ColorRepresentation, DirectionalLight, GridHelper, Intersection, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, Vector2, WebGLRenderer, WebGLRendererParameters } from 'three';
import { Clock } from './clock';
import { Emitter } from './emitter';
import { Input } from './input';
import { rng } from './rng';
import { ThreeJsCameraRig } from './threejs-camera-rig';
import './main.css';

const emitter = Emitter.instance;
const input = Input.instance;

export interface SetupBasicSceneParams {
    ambientLight?: boolean,
    directionalLight?: boolean,
    gridHelper?: boolean,
    cameraDistance?: number,
}

export interface ThreeJsBoilerPlateParams {
    parentElement?: HTMLElement,
    renderer?: WebGLRendererParameters,
    camera?: {
        fov?: number,
        aspect?: number,
        near?: number,
        far?: number,
    },
    seed?: number,
}

export class ThreeJsBoilerPlate {
    public clock: Clock;
    public renderer: WebGLRenderer;
    public scene: Scene;
    public cameraRig: ThreeJsCameraRig;

    private _raycaster: Raycaster | undefined;

    public get raycaster(): Raycaster {
        if (!this._raycaster) {
            this._raycaster = new Raycaster();
        }

        return this._raycaster;
    }

    public get canvas(): HTMLCanvasElement { return this.renderer.domElement; }
    public get camera(): PerspectiveCamera { return this.cameraRig.camera; }

    public rng = rng;

    constructor(params?: ThreeJsBoilerPlateParams) {
        rng.seed = params?.seed ?? rng.seed;

        this.clock = new Clock();

        this.renderer = new WebGLRenderer(params?.renderer);
        input.setParent(this.renderer.domElement);

        this.scene = new Scene();

        this.cameraRig = new ThreeJsCameraRig(params?.camera);
        this.scene.add(this.cameraRig);

        emitter
            .on('mouse_move', ({ deltaX, deltaY }: KeyValue) => {
                if (input.isMouseButtonDown(0)) {
                    this.cameraRig.orbit(deltaX, deltaY);
                }
            })
            .on('mouse_wheel', ({ deltaY }: KeyValue) => this.cameraRig.dolly(deltaY));

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

            this.cameraRig.camera.aspect = displayWidth / displayHeight;
            this.cameraRig.camera.updateProjectionMatrix();

            resized = true;
        }

        return resized;
    }

    public setupBasicScene(params: SetupBasicSceneParams = {}) {
        this.camera.position.z = params.cameraDistance ?? 5;

        if (params.ambientLight !== false) this.scene.add(new AmbientLight());
        if (params.directionalLight !== false) this.scene.add(new DirectionalLight());
        if (params.gridHelper !== false) this.scene.add(new GridHelper(100, 100, 0xff0000));
    }

    public pick(): Intersection | null {
        const pickX = (input.mousePosition[0] / this.renderer.domElement.width) * 2 - 1;
        const pickY = -(input.mousePosition[1] / this.renderer.domElement.height) * 2 + 1;

        this.raycaster.setFromCamera(new Vector2(pickX, pickY), this.cameraRig.camera);

        const intersected = this.raycaster.intersectObjects(this.scene.children);

        return intersected.length ? intersected[0] : null;
    }

    public static CreateCubeMesh(size: number = 1, color: ColorRepresentation = 0xff0000): Mesh {
        const cubeMesh = new Mesh(
            new BoxGeometry(size, size, size),
            new MeshLambertMaterial({ color }),
        );

        cubeMesh.name = 'CubeMesh';

        return cubeMesh;
    }

    public static CreatePlaneMesh(size: number = 10, segments: number = 10, color: ColorRepresentation = 0xff0000): Mesh {
        return new Mesh(
            new PlaneGeometry(size, size, segments, segments),
            new MeshLambertMaterial({ color, wireframe: true }),
        );
    }
}
