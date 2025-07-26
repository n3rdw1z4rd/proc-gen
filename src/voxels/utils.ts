import { vec3 } from 'gl-matrix';

export function xyz2key(position: vec3, delimiter: string = ','): string {
    const [x, y, z] = position;
    return `${x}${delimiter}${y}${delimiter}${z}`;
}

export function key2xyz(key: string, delimiter: string = ','): [number, number, number] {
    return key.split(delimiter).map((s: string) => parseFloat(s)) as [number, number, number];
}
