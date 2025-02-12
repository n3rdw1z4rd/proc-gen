import { Emitter } from './emitter';

const emitter = Emitter.instance;

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

export class Input {
    private _parent: HTMLElement | Window = window;

    public inputThreshold: number = 200;
    private _keyStates: { [key: string]: InputState } = {};
    private _mouseButtonStates: { [key: number]: InputState } = {};

    private _mousePosition: VEC2 = [0, 0];
    private _mousePosition2: VEC2 = [0, 0];
    public get mousePosition(): VEC2 { return this._mousePosition; }
    public get mousePosition2(): VEC2 { return this._mousePosition2; }

    private static _instance: Input;

    public static get instance(): Input {
        if (!Input._instance) {
            Input._instance = new Input();
        }

        return Input._instance;
    }

    private constructor() {
        this.setParent();
    }

    private _removeListeners() {
        // this._parent.removeEventListener('contextmenu', this._onContextMenu.bind(this));
        this._parent.removeEventListener('keydown', this._onKeyDown.bind(this) as EventListener);
        this._parent.removeEventListener('keyup', this._onKeyUp.bind(this) as EventListener);
        this._parent.removeEventListener('mousedown', this._onMouseButtonDown.bind(this) as EventListener);
        this._parent.removeEventListener('mouseup', this._onMouseButtonUp.bind(this) as EventListener);
        this._parent.removeEventListener('mousemove', this._onMouseMove.bind(this) as EventListener);
        this._parent.removeEventListener('wheel', this._onWheel.bind(this) as EventListener);
        // TODO: add gamepad states
        // TODO: add touch states
    }

    public setParent(parent?: HTMLElement | Window) {
        this._removeListeners();
        this._parent = parent ?? this._parent;

        // this._parent.addEventListener('contextmenu', this._onContextMenu.bind(this));
        this._parent.addEventListener('keydown', this._onKeyDown.bind(this) as EventListener);
        this._parent.addEventListener('keyup', this._onKeyUp.bind(this) as EventListener);
        this._parent.addEventListener('mousedown', this._onMouseButtonDown.bind(this) as EventListener);
        this._parent.addEventListener('mouseup', this._onMouseButtonUp.bind(this) as EventListener);
        this._parent.addEventListener('mousemove', this._onMouseMove.bind(this) as EventListener);
        this._parent.addEventListener('wheel', this._onWheel.bind(this) as EventListener);
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

    // private _onContextMenu(ev: MouseEvent) {
    //     ev.preventDefault();
    //     emitter.emit('contextmenu');
    //     return false;
    // }

    private _onKeyDown(ev: KeyboardEvent) {
        const props = this._getCommonEventProps(ev);

        const { code, key } = ev;

        if (!ev.repeat) {
            this._keyStates[code] = { state: 1, timeStamp: props.timeStamp };
            emitter.emit('key_down', { ...props, code, key });
        }
    }

    private _onKeyUp(ev: KeyboardEvent) {
        const props = this._getCommonEventProps(ev);

        const { code, key } = ev;
        const deltaStamp = props.timeStamp - (this._keyStates[code]?.timeStamp ?? 0);

        this._keyStates[code] = { state: 0, timeStamp: props.timeStamp };
        emitter.emit('key_up', { ...props, code, key });

        if (deltaStamp < this.inputThreshold) {
            emitter.emit('key_pressed', { ...props, code, key });
        }
    }

    private _onMouseButtonDown(ev: MouseEvent) {
        const props = this._getCommonEventProps(ev);

        const { button } = ev;

        if (!this._mouseButtonStates[button]?.state) {
            this._mouseButtonStates[button] = { state: 1, timeStamp: props.timeStamp };
            emitter.emit('mouse_button_down', { ...props, button });
        }
    }

    private _onMouseButtonUp(ev: MouseEvent) {
        const props = this._getCommonEventProps(ev);

        const { button } = ev;
        const deltaStamp = props.timeStamp - (this._mouseButtonStates[button]?.timeStamp ?? 0);

        this._mouseButtonStates[button] = { state: 0, timeStamp: props.timeStamp };
        emitter.emit('mouse_button_up', { ...props, button });

        if (deltaStamp < this.inputThreshold) {
            emitter.emit('mouse_button_clicked', { ...props, button });
        }
    }

    private _onMouseMove(ev: MouseEvent) {
        const props = this._getCommonEventProps(ev);

        const { buttons, offsetX, offsetY, movementX, movementY } = ev;

        this._mousePosition = [offsetX, offsetY];

        const width = this._parent instanceof Window ? this._parent.innerWidth : this._parent.clientWidth;
        const height = this._parent instanceof Window ? this._parent.innerHeight : this._parent.clientHeight;

        this._mousePosition2 = [
            (ev.clientX / width) * 2 - 1,
            -(ev.clientY / height) * 2 + 1,
        ];

        emitter.emit('mouse_move', {
            ...props,
            buttons,
            x: offsetX,
            y: offsetY,
            deltaX: movementX,
            deltaY: movementY,
        });
    }

    private _onWheel(ev: WheelEvent) {
        const props = this._getCommonEventProps(ev);
        const { deltaX, deltaY, deltaZ } = ev;

        emitter.emit('mouse_wheel', {
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
