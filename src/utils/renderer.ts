import { CreateWebGlContext, GL, ProgramInfo } from './webgl';

export interface RendererParams {
    canvas?: HTMLCanvasElement,
    parent?: HTMLElement,
}

export class Renderer {
    public gl: GL;

    public programInfo: ProgramInfo | undefined;

    public get canvas(): HTMLCanvasElement { return this.gl.canvas as HTMLCanvasElement; }
    public get width(): number { return this.gl.canvas.width; }
    public get height(): number { return this.gl.canvas.height; }

    constructor() {
        this.gl = CreateWebGlContext();

        this.gl.enable(this.gl.DEPTH_TEST);
    }

    public setParent(htmlElement?: HTMLElement) {
        if (this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }

        if (htmlElement) {
            htmlElement.appendChild(this.canvas);
            this.setSize();
        }
    }

    public setSize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            this.canvas.parentElement?.getBoundingClientRect() ??
            this.canvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width));
        displayHeight = (0 | (displayHeight ?? height));

        if (this.width !== displayWidth || this.height !== displayHeight) {
            this.gl.canvas.width = displayWidth
            this.gl.canvas.height = displayHeight;
            this.gl.viewport(0, 0, displayWidth, displayHeight);
            return true;
        }

        return false;
    }

    render(_deltaTime: number) {
        if (this.programInfo) {

        }
    }
}
