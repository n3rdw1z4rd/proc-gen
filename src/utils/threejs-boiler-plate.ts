import { AmbientLight, BoxGeometry, ColorRepresentation, DirectionalLight, GridHelper, Intersection, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, Texture, TextureLoader, Vector2, WebGLRenderer, WebGLRendererParameters } from 'three';
import { Clock } from './clock';
import { Input } from './input';
import { rng } from './rng';
import { TextureData } from './texture-atlas';
import { ThreeJsCameraRig } from './threejs-camera-rig';
import './main.css';

export type OnFrameFunction = (deltaTime: number) => void;

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
    }
}

export class ThreeJsBoilerPlate extends Input {
    public clock: Clock;
    public renderer: WebGLRenderer;
    public scene: Scene;
    public cameraRig: ThreeJsCameraRig;

    public raycaster: Raycaster | undefined;

    public get canvas(): HTMLCanvasElement { return this.renderer.domElement; }
    public get camera(): PerspectiveCamera { return this.cameraRig.camera; }

    public rng = rng;

    constructor(params?: ThreeJsBoilerPlateParams) {
        super();

        Input.GlobalInstance = this; // TODO: is there a better way to ensure "this" is the GlobalInstance?

        this.clock = new Clock();

        this.renderer = new WebGLRenderer(params?.renderer);

        this.scene = new Scene();

        this.cameraRig = new ThreeJsCameraRig(params?.camera);

        this.on('mouse_move', ({ deltaX, deltaY }: KeyValue) =>
            (this.isMouseButtonDown(0) && this.cameraRig.orbit(deltaX, deltaY))
        );

        this.on('mouse_wheel', ({ deltaY }: KeyValue) => this.cameraRig.dolly(deltaY));

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
        this.cameraRig.position.z = params.cameraDistance ?? 5;

        if (params.ambientLight !== false) this.scene.add(new AmbientLight());
        if (params.directionalLight !== false) this.scene.add(new DirectionalLight());
        if (params.gridHelper !== false) this.scene.add(new GridHelper(100, 100, 0xff0000));
    }

    public pick(): Intersection | null {
        if (!this.raycaster) {
            this.raycaster = new Raycaster();
        }

        const pickX = (this.mousePosition[0] / this.renderer.domElement.width) * 2 - 1;
        const pickY = -(this.mousePosition[1] / this.renderer.domElement.height) * 2 + 1;

        this.raycaster.setFromCamera(new Vector2(pickX, pickY), this.cameraRig.camera);

        const intersected = this.raycaster.intersectObjects(this.scene.children);

        return intersected.length ? intersected[0] : null;
    }

    public static LoadTexture(url: string): Promise<TextureData> {
        return new Promise<TextureData>((res, rej) => {
            (new TextureLoader()).load(
                url,
                (texture: Texture) => {
                    const width = texture.source.data.width;
                    const height = texture.source.data.height;
                    res({ width, height, texture });
                },
                (_ev) => { },
                (err) => rej(err),
            );
        });
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
