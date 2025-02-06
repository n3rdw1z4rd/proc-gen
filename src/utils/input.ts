import { Emitter } from './emitter';

export interface InputState {
    state: number,
    timeStamp: number,
}

export interface CommonEventProps {
    timeStamp: number,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    shiftKey: boolean,
}

export class Input extends Emitter {
    public inputThreshold: number = 200;
    private _keyStates: { [key: string]: InputState } = {};
    private _mouseButtonStates: { [key: number]: InputState } = {};

    private _mousePosition: VEC2 = [0, 0];
    public get mousePosition(): VEC2 { return this._mousePosition; }

    private static _globalInstance: Input;

    public static get GlobalInstance(): Input {
        if (!Input._globalInstance) {
            Input._globalInstance = new Input();
        }

        return Input._globalInstance;
    }

    public static set GlobalInstance(instance: Input) {
        Input._globalInstance = instance;
    }

    constructor() {
        super();

        window.addEventListener('contextmenu', this._onContextMenu.bind(this));
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

    private _onContextMenu(ev: MouseEvent) {
        ev.preventDefault();
        this.emit('contextmenu');
        return false;
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
}
