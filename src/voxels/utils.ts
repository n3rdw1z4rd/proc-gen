import { vec3 } from 'gl-matrix';

export function xyz2i(position: vec3): string {
    const [x, y, z] = position;
    return `${x},${y},${z}`;
}
