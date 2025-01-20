import { Emitter } from './emitter';
import { log } from './logger';

export class Input extends Emitter {
    private _mousePosition: [number, number] = [0, 0];
    public get mousePosition(): [number, number] { return this._mousePosition; }

    constructor() {
        super();

        window.addEventListener('mousemove', this._onMouseMove.bind(this));
    }

    private _onMouseMove(event: MouseEvent) {
        log('_onMouseMove:', event);

        let x = event.clientX;
        let y = event.clientY;

        if (event.target instanceof HTMLCanvasElement) {
            const rect = event.target.getBoundingClientRect();

            x = (event.clientX - rect.left) * event.target.width / rect.width;
            y = (event.clientY - rect.top) * event.target.height / rect.height;
        }

        this._mousePosition = [x, y];
    }
}
