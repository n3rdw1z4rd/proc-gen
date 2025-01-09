export interface GL extends WebGL2RenderingContext { }

export enum ShaderType {
    VERTEX = WebGL2RenderingContext.VERTEX_SHADER,
    FRAGMENT = WebGL2RenderingContext.FRAGMENT_SHADER,
}

export type ProgramLocations = { attributes: KeyValue, uniforms: KeyValue };
export type ProgramInfo = { program: WebGLProgram, attributes: KeyValue, uniforms: KeyValue };
export type Color = [number, number, number, number];

export interface RendererParams {
    canvas?: HTMLCanvasElement,
    parent?: HTMLElement,
}

export class Renderer {
    public gl: GL;

    public get canvas(): HTMLCanvasElement { return this.gl.canvas as HTMLCanvasElement; }
    public get width(): number { return this.gl.canvas.width; }
    public get height(): number { return this.gl.canvas.height; }

    constructor({ canvas, parent }: RendererParams) {
        canvas = canvas ?? document.createElement('canvas') as HTMLCanvasElement;

        this.gl = canvas.getContext('webgl2') as GL;

        if (!this.gl) {
            throw 'CreateWebGL2RenderingContext: failed to create a WebGL2RenderingContext';
        }

        if (parent) {
            this.appendTo(parent);
        }
    }

    public appendTo(htmlElement?: HTMLElement, autoResize: boolean = true) {
        const canvas = (this.gl.canvas as HTMLCanvasElement);

        if (canvas.parentElement) {
            canvas.parentElement.removeChild(canvas);
        }

        if (htmlElement) {
            htmlElement.appendChild(canvas);

            if (autoResize) {
                this.resize();
            }
        }
    }

    public resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            (this.gl.canvas as HTMLCanvasElement).parentElement?.getBoundingClientRect() ??
            (this.gl.canvas as HTMLCanvasElement).getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width));
        displayHeight = (0 | (displayHeight ?? height));

        if (this.gl.canvas.width !== displayWidth || this.gl.canvas.height !== displayHeight) {
            this.gl.canvas.width = displayWidth
            this.gl.canvas.height = displayHeight;

            this.gl.viewport(0, 0, displayWidth, displayHeight);

            return true;
        }

        return false;
    }

    public static CompileShader(gl: GL, type: ShaderType, source: string): WebGLShader {
        const shader: WebGLShader = gl.createShader(type)!;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw `CompileShader: failed to compile shader: ${gl.getShaderInfoLog(shader)}`;
        }

        return shader;
    }

    public static CreateProgram(gl: GL, vertexShader: WebGLShader | string, fragmentShader: WebGLShader | string): WebGLProgram {
        if (typeof vertexShader === 'string') {
            vertexShader = Renderer.CompileShader(gl, ShaderType.VERTEX, vertexShader) as WebGLShader;
        }

        if (typeof fragmentShader === 'string') {
            fragmentShader = Renderer.CompileShader(gl, ShaderType.FRAGMENT, fragmentShader) as WebGLShader;
        }

        const program: WebGLProgram = gl.createProgram()!;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw `CreateProgram: failed to link program: ${gl.getProgramInfoLog(program)}`;
        }

        return program;
    }

    public static GetProgramLocations(gl: GL, program: WebGLProgram): ProgramLocations {
        const attributes: KeyValue = {};
        const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < attributeCount; i++) {
            const info = gl.getActiveAttrib(program, i)!;
            attributes[info.name] = gl.getAttribLocation(program, info.name);
        }

        const uniforms: KeyValue = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < uniformCount; i++) {
            const info = gl.getActiveUniform(program, i)!;
            uniforms[info.name] = gl.getUniformLocation(program, info.name);
        }

        return { attributes, uniforms } as ProgramLocations;
    }

    public static CreateProgramInfo(gl: GL, vertexShaderSource: string, fragmentShaderSource: string): ProgramInfo {
        const program: WebGLProgram = Renderer.CreateProgram(
            gl, vertexShaderSource, fragmentShaderSource
        );

        const locations: KeyValue = Renderer.GetProgramLocations(gl, program);

        return { program, ...locations } as ProgramInfo;
    }
}
