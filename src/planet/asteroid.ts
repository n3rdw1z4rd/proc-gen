// import { Group, IcosahedronGeometry, Mesh, MeshLambertMaterial } from "three";
// import { log } from '../utils/logger';
// import { rng } from '../utils/rng';
// import { noise } from '../utils/noise';

// export class Asteroid extends Group {
//     geometry: IcosahedronGeometry;
//     material: MeshLambertMaterial;
//     mesh: Mesh;

//     constructor(params: any = {}) {
//         super();

//         const scale = params.scale ?? 10;
//         log('scale:', scale);

//         this.geometry = new IcosahedronGeometry(1, 1);
//         this.material = params.material || new MeshLambertMaterial({
//             color: rng.nextf * 0xffffff,
//             flatShading: true,
//         });

//         const vertices = this.geometry.getAttribute('position');
//         const normals = this.geometry.getAttribute('normal');

//         for (var i = 0; i < vertices.length; i += 3) {
//             const h = noise(vertices[i] / scale, vertices[i + 1] / scale, vertices[i + 2] / scale);

//             vertices[i] = vertices[i] + normals[i] * h;
//             vertices[i + 1] = vertices[i + 1] + normals[i + 1] * h;
//             vertices[i + 1] = vertices[i + 1] + normals[i + 1] * h;
//         }

//         this.geometry.computeVertexNormals();
//         this.geometry.attributes.position.needsUpdate = true;

//         this.mesh = new Mesh(this.geometry, this.material);
//         this.add(this.mesh);

//         this.scale.multiplyScalar(100);
//     }
// }
