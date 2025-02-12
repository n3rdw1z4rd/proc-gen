const DEG2RAD = 0.01745329;

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function deg2rad(value: number): number {
    return value * DEG2RAD;
}

export function lerp(start: number, end: number, scale: number): number {
    return start * (1 - scale) + end * scale;
}

export function normalizeVec3(v: VEC3): VEC3 {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return (len > 0 ? v.map((n: number) => n / len) : [0, 0, 0]) as VEC3;
}

export function crossVec3(a: VEC3, b: VEC3): VEC3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}
