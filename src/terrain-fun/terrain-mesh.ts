import { BufferGeometry, Float32BufferAttribute, Material, Mesh } from 'three';
import { clamp } from '../utils/math';

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
        heightFunc?: (x: number, y: number, z: number) => number
    ) {
        const indices = [];
        const vertices = [];
        const normals = [];
        const colors = [];

        const halfSize = this.size / 2;
        const segmentSize = this.size / this.segments;

        for (let i = 0; i <= this.segments; i++) {
            for (let j = 0; j <= this.segments; j++) {
                const x = (j * segmentSize) - halfSize;
                const z = (i * segmentSize) - halfSize;
                const y = heightFunc ? heightFunc(x, 0, z) : 0;
                const c = clamp(y, this.minColor, 1.0);

                vertices.push(x, y, z);
                normals.push(0, 1, 0);
                colors.push(c, c, c);
            }
        }

        for (let i = 0; i < this.segments; i++) {
            for (let j = 0; j < this.segments; j++) {
                const a = i * (this.segments + 1) + (j + 1);
                const b = i * (this.segments + 1) + j;
                const c = (i + 1) * (this.segments + 1) + j;
                const d = (i + 1) * (this.segments + 1) + (j + 1);

                // generate two faces (triangles) per iteration

                indices.push(a, b, d); // face one
                indices.push(b, c, d); // face two
            }
        }

        const geometry = new BufferGeometry();

        geometry.setIndex(indices);
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

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
