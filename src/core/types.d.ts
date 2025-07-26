declare module "*.glsl" {
    const value: string;
    export default value;
}

declare module "*.vert" {
    const value: string;
    export default value;
}

declare module "*.frag" {
    const value: string;
    export default value;
}

declare type KeyValue = { [key: string]: any };
declare type Color = string | CanvasGradient | CanvasPattern;

declare interface Point {
    x: number,
    y: number,
    z?: number,
}
