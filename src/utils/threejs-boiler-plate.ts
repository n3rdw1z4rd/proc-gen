import { AmbientLight, BoxGeometry, ColorRepresentation, DirectionalLight, GridHelper, Intersection, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, Texture, TextureLoader, Vector2, WebGLRenderer, WebGLRendererParameters } from 'three';
import { Input } from './input';
import { Clock } from './clock';
import { rng } from './rng';
import { clamp } from './math';
import './main.css';

export interface TextureData {
    width: number,
    height: number,
    texture: Texture,
}

export class TextureAtlas {
    tileWidth: number;
    tileHeight: number;
    textureWidth: number;
    textureHeight: number;

    texture: Texture;

    uvxSize: number;
    uvySize: number;

    maxVoxelNumber: number;

    constructor(textureData: TextureData, tileWidth: number = 16, tileHeight: number = tileWidth) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.textureWidth = textureData.width;
        this.textureHeight = textureData.height;
        this.texture = textureData.texture;

        this.uvxSize = this.tileWidth / this.textureWidth;
        this.uvySize = this.tileHeight / this.textureHeight;

        this.maxVoxelNumber = (this.textureWidth / this.tileWidth) * (this.textureHeight / this.tileHeight);
    }

    get(voxel: number, ux: number, uy: number): [number, number] {
        voxel = clamp(voxel, 0, this.maxVoxelNumber);

        const uvx = (voxel + ux) * this.uvxSize;
        const uvy = 1 - (1 - uy) * this.uvySize;

        return [uvx, uvy];
    }
}

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
    public camera: PerspectiveCamera;
    public scene: Scene;

    public raycaster: Raycaster | undefined;

    public get canvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public rng = rng;

    constructor(params?: ThreeJsBoilerPlateParams) {
        super();

        Input.GlobalInstance = this; // TODO: is there a better way to ensure "this" is the GlobalInstance?

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

    public setupBasicScene(params: SetupBasicSceneParams = {}) {
        this.camera.position.z = params.cameraDistance ?? 5;

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

        this.raycaster.setFromCamera(new Vector2(pickX, pickY), this.camera);

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
