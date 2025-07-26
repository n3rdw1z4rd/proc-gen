import { vec2 } from "gl-matrix";

export class Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    center(): vec2 {
        return vec2.fromValues(
            this.x + this.w / 2,
            this.y + this.h / 2,
        );
    }

    intersects(that: Rectangle, padding: number = 0): boolean {
        return (
            that.x - padding >= this.x + this.w + padding ||
            this.x - padding >= that.x + that.w + padding ||
            this.y - padding >= that.y + that.h + padding ||
            that.y - padding >= that.y + this.h + padding
        ) ? false : true;
    }

    vectorInside(vec: vec2, padding: number = 0): boolean {
        let [x, y] = vec;

        return (
            x >= this.x - padding && x <= this.x + this.w + padding &&
            y >= this.y - padding && y <= this.y + this.h + padding
        );
    }
}