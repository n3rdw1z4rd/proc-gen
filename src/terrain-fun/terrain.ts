import { Material, Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';

export interface TerrainChunkParams {
    octaves: number,
    frequency: number,
    persistence: number,
    amplitude: number,
    material?: Material,
}

const DEFAULT_TERRAIN_CHUNK_PARAMS: TerrainChunkParams = {
    octaves: 4,
    frequency: 0.5,
    persistence: 0.5,
    amplitude: 1.0,
}

export class TerrainChunk extends Mesh {
    private _octaves: number = 4;
    private _frequency: number = 0.5;
    private _persistence: number = 0.5;
    private _amplitude: number = 1.0;
    private _lacunarity: number = 2.0;

    constructor(
        public readonly size: number = 16,
        public readonly segments: number = 64,
        terrainParams?: TerrainChunkParams,
    ) {
        super();

        terrainParams = { ...DEFAULT_TERRAIN_CHUNK_PARAMS, ...terrainParams };

        this.geometry = new PlaneGeometry(size, size, segments, segments);
        this.material = terrainParams.material ?? new MeshLambertMaterial({ wireframe: true });

        this._generate();
    }

    private _generate() {
        const vertices = this.geometry.getAttribute('position');

        if (vertices) {
            for (let c = 0; c < vertices.count; c++) {
                const xi = c * 3;
                const yi = xi + 1
                const zi = yi + 1;

                // vertices.array[yi] = noise(
                //     vertices.array[xi],
                //     vertices.array[zi], {
                //     octaves: this._octaves,
                //     frequency: this._frequency,
                //     persistence: this._persistence,
                //     amplitude: this._amplitude,
                //     lacunarity: this._lacunarity,
                // });
            }

            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.computeVertexNormals();
        }
    }

    // public get amplitude(): number { return this._amplitude; }
    // public set amplitude(value: number) {
    //     this._amplitude = value;
    //     this._generate();
    // }

    // public get frequency(): number { return this._frequency; }
    // public set frequency(value: number) {
    //     this._frequency = value;
    //     this._generate();
    // }

    // public get octaves(): number { return this._octaves; }
    // public set octaves(value: number) {
    //     this._octaves = value;
    //     this._generate();
    // }

    // public get persistence(): number { return this._persistence; }
    // public set persistence(value: number) {
    //     this._persistence = value;
    //     this._generate();
    // }
}
