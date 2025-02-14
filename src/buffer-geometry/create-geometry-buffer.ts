import { BufferGeometry, Float32BufferAttribute } from 'three';

export function CreatePlaneBufferGeometry(size: number, segments: number): BufferGeometry {
    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    // const uvs: number[] = []; // TODO: implement textures, and TextureAtlas
    const colors: number[] = [];

    const halfSize = size / 2;
    const segmentSize = size / segments;

    for (let sz = 0; sz <= segments; sz++) {
        for (let sx = 0; sx <= segments; sx++) {
            const x = (sx * segmentSize) - halfSize;
            const z = (sz * segmentSize) - halfSize;

            vertices.push(x, 0, z);
            normals.push(0, 1, 0);
            // uvs.push(uvx, uvy); // TODO: implement textures, and TextureAtlas
            colors.push(1, 0, 0);
        }
    }

    for (let sz = 0; sz < segments; sz++) {
        for (let sx = 0; sx < segments; sx++) {
            const a = sz * (segments + 1) + (sx + 1);
            const b = sz * (segments + 1) + sx;
            const c = (sz + 1) * (segments + 1) + sx;
            const d = (sz + 1) * (segments + 1) + (sx + 1);

            indices.push(a, b, d, b, c, d);
        }
    }

    const geometry = new BufferGeometry();

    geometry.setIndex(indices);
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    // geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2)); // TODO: implement textures, and TextureAtlas
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return geometry;
}

export function CreateCubeBufferGeometry(size: number, segments: number): BufferGeometry {
    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];

    const halfSize = size / 2;
    const segmentSize = size / segments;

    const faces = [
        { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] }, // Top
        { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1] }, // Bottom
        { normal: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }, // Right
        { normal: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, -1] }, // Left
        { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, // Front
        { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] } // Back
    ];

    faces.forEach(({ normal, u, v }) => {
        const startIndex = vertices.length / 3;

        for (let sy = 0; sy <= segments; sy++) {
            for (let sx = 0; sx <= segments; sx++) {
                const x = (-halfSize) + (sx * segmentSize) * u[0] + (sy * segmentSize) * v[0];
                const y = (-halfSize) + (sx * segmentSize) * u[1] + (sy * segmentSize) * v[1];
                const z = (-halfSize) + (sx * segmentSize) * u[2] + (sy * segmentSize) * v[2];

                vertices.push(x, y, z);
                normals.push(...normal);
                colors.push(1, 0, 0);
            }
        }

        for (let sy = 0; sy < segments; sy++) {
            for (let sx = 0; sx < segments; sx++) {
                const a = startIndex + sy * (segments + 1) + (sx + 1);
                const b = startIndex + sy * (segments + 1) + sx;
                const c = startIndex + (sy + 1) * (segments + 1) + sx;
                const d = startIndex + (sy + 1) * (segments + 1) + (sx + 1);

                indices.push(a, b, d, b, c, d);
            }
        }
    });

    const geometry = new BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return geometry;
}
