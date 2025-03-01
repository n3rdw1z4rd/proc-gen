import { TextureAtlas } from '../core';
import { BufferGeometry, Float32BufferAttribute, Material, Mesh } from 'three';

export class TerrainMesh extends Mesh {
    public readonly size: number;
    public readonly segments: number;

    public minColor: number = 0.01;

    constructor(
        size: number = 1,
        segments: number = 1,
        material: Material,
    ) {
        super();

        this.size = Math.max(Math.abs(size), 1);
        this.segments = Math.max(Math.abs(segments), 1);
        this.material = material;

        this.createGeometry();
    }

    public createGeometry(
        heightFunc?: (x: number, y: number, z: number) => number,
        textureIndices?: (xSeg: number, zSeg: number) => number,
    ) {
        // CREDIT: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_indexed.html

        if (!(this.material instanceof TextureAtlas)) {
            console.warn("TerrainMesh requires a TextureAtlas material to map textures.");
            return;
        }

        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        const colors = [];

        const halfSize = this.size / 2;
        const segmentSize = this.size / this.segments;

        for (let zSeg = 0; zSeg <= this.segments; zSeg++) {
            for (let xSeg = 0; xSeg <= this.segments; xSeg++) {
                const x = (xSeg * segmentSize) - halfSize;
                const z = (zSeg * segmentSize) - halfSize;
                const y = heightFunc ? heightFunc(x, 0, z) : 0;
                const c = 1.0;//clamp(y, this.minColor, 1.0);

                vertices.push(x, y, z);
                normals.push(0, 1, 0);
                colors.push(c, c, c);

                if (textureIndices) {
                }
                const textureIndex = textureIndices ? textureIndices(xSeg, zSeg) : 0;
                const [u, v] = this.material.getUv(textureIndex, xSeg % 2, zSeg % 2);
                uvs.push(u, v);
            }
        }

        for (let zSeg = 0; zSeg < this.segments; zSeg++) {
            for (let xSeg = 0; xSeg < this.segments; xSeg++) {
                const a = zSeg * (this.segments + 1) + (xSeg + 1);
                const b = zSeg * (this.segments + 1) + xSeg;
                const c = (zSeg + 1) * (this.segments + 1) + xSeg;
                const d = (zSeg + 1) * (this.segments + 1) + (xSeg + 1);

                indices.push(a, b, d, b, c, d);
            }
        }

        const geometry = new BufferGeometry();

        geometry.setIndex(indices);
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

        if (textureIndices) {
        }
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

        this.geometry = geometry;
    }

    public forEachVertex(vertxCallback: (x: number, y: number, z: number) => number) {
        const vertices = this.geometry.getAttribute('position');

        if (vertices?.count) {
            for (let i = 0; i < vertices.count; i += 1) {
                const xi = i * 3;
                const yi = xi + 1;
                const zi = xi + 2;

                const x = vertices.array[xi];
                const y = vertices.array[yi];
                const z = vertices.array[zi];

                vertices.array[yi] = vertxCallback(x, y, z);
            }

            // this.geometry.attributes.position.needsUpdate = true;
            // this.geometry.computeVertexNormals();
        }
    }
}
