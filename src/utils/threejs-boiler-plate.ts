import { AmbientLight, BoxGeometry, ColorRepresentation, DirectionalLight, GridHelper, Intersection, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, Texture, TextureLoader, Vector2, WebGLRenderer, WebGLRendererParameters } from 'three';
import { Clock } from './clock';
import { Emitter } from './emitter';
import './main.css';

export interface TextureData {
    width: number,
    height: number,
    texture: Texture,
}

export interface SetupBasicSceneParams {
    ambientLight?: boolean,
    directionalLight?: boolean,
    gridHelper?: boolean,
}

export interface CommonEventProps {
    timeStamp: number,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    shiftKey: boolean,
}

export interface InputState {
    state: number,
    timeStamp: number,
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

export class ThreeJsBoilerPlate extends Emitter {
    public clock: Clock;
    public renderer: WebGLRenderer;
    public camera: PerspectiveCamera;
    public scene: Scene;

    public inputThreshold: number = 200;
    private _keyStates: { [key: string]: InputState } = {};
    private _mouseButtonStates: { [key: number]: InputState } = {};

    private _mousePosition: VEC2 = [0, 0];
    public get mousePosition(): VEC2 { return this._mousePosition; }

    public raycaster: Raycaster | undefined;

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

        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
        window.addEventListener('mousedown', this._onMouseButtonDown.bind(this));
        window.addEventListener('mouseup', this._onMouseButtonUp.bind(this));
        window.addEventListener('mousemove', this._onMouseMove.bind(this));
        window.addEventListener('wheel', this._onWheel.bind(this));
        // TODO: add gamepad states
        // TODO: add touch states
    }

    private _getCommonEventProps(ev: KeyboardEvent | MouseEvent | WheelEvent): CommonEventProps {
        const props: CommonEventProps = {
            timeStamp: ev.timeStamp,
            altKey: ev.altKey,
            ctrlKey: ev.ctrlKey,
            metaKey: ev.metaKey,
            shiftKey: ev.shiftKey,
        };

        return props;
    }

    private _onKeyDown(ev: KeyboardEvent) {
        const props = this._getCommonEventProps(ev);

        const { code, key } = ev;

        if (!ev.repeat) {
            this._keyStates[code] = { state: 1, timeStamp: props.timeStamp };
            this.emit('key_down', { ...props, code, key });
        }
    }

    private _onKeyUp(ev: KeyboardEvent) {
        const props = this._getCommonEventProps(ev);

        const { code, key } = ev;
        const deltaStamp = props.timeStamp - (this._keyStates[code]?.timeStamp ?? 0);

        this._keyStates[code] = { state: 0, timeStamp: props.timeStamp };
        this.emit('key_up', { ...props, code, key });

        if (deltaStamp < this.inputThreshold) {
            this.emit('key_pressed', { ...props, code, key });
        }
    }

    private _onMouseButtonDown(ev: MouseEvent) {
        const props = this._getCommonEventProps(ev);

        const { button } = ev;

        if (!this._mouseButtonStates[button]?.state) {
            this._mouseButtonStates[button] = { state: 1, timeStamp: props.timeStamp };
            this.emit('mouse_button_down', { ...props, button });
        }
    }

    private _onMouseButtonUp(ev: MouseEvent) {
        const props = this._getCommonEventProps(ev);

        const { button } = ev;
        const deltaStamp = props.timeStamp - (this._mouseButtonStates[button]?.timeStamp ?? 0);

        this._mouseButtonStates[button] = { state: 0, timeStamp: props.timeStamp };
        this.emit('mouse_button_up', { ...props, button });

        if (deltaStamp < this.inputThreshold) {
            this.emit('mouse_button_clicked', { ...props, button });
        }
    }

    private _onMouseMove(ev: MouseEvent) {
        const props = this._getCommonEventProps(ev);

        const { buttons, offsetX, offsetY, movementX, movementY } = ev;

        this._mousePosition = [offsetX, offsetY];

        this.emit('mouse_move', {
            ...props,
            buttons,
            x: offsetX,
            y: offsetY,
            deltaX: movementX,
            deltaY: movementY,
        })
    }

    private _onWheel(ev: WheelEvent) {
        const props = this._getCommonEventProps(ev);
        const { deltaX, deltaY, deltaZ } = ev;

        this.emit('mouse_wheel', {
            ...props,
            deltaX, deltaY, deltaZ,
        });
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
        if (params.ambientLight !== false) this.scene.add(new AmbientLight());
        if (params.directionalLight !== false) this.scene.add(new DirectionalLight());
        if (params.gridHelper !== false) this.scene.add(new GridHelper(100, 100, 0xff0000));
    }

    public pick(): Intersection | null {
        if (!this.raycaster) {
            this.raycaster = new Raycaster();
        }

        const pickX = (this._mousePosition[0] / this.renderer.domElement.width) * 2 - 1;
        const pickY = -(this._mousePosition[1] / this.renderer.domElement.height) * 2 + 1;

        this.raycaster.setFromCamera(new Vector2(pickX, pickY), this.camera);

        const intersected = this.raycaster.intersectObjects(this.scene.children);

        return intersected.length ? intersected[0] : null;
    }

    public isKeyDown(keyCode: string): boolean {
        return this._keyStates[keyCode]?.state === 1 ? true : false;
    }

    public getKeyState(keyCode: string): number {
        return this._keyStates[keyCode]?.state ?? 0;
    }

    public isMouseButtonDown(mouseButton: number): boolean {
        return this._mouseButtonStates[mouseButton]?.state === 1 ? true : false;
    }

    public getMouseButtonState(button: number): number {
        return this._mouseButtonStates[button]?.state ?? 0;
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
        return new Mesh(
            new BoxGeometry(size, size, size),
            new MeshLambertMaterial({ color }),
        );
    }

    public static CreatePlaneMesh(size: number = 10, segments: number = 10, color: ColorRepresentation = 0xff0000): Mesh {
        return new Mesh(
            new PlaneGeometry(size, size, segments, segments),
            new MeshLambertMaterial({ color, wireframe: true }),
        );
    }
}
