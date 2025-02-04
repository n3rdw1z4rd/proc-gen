import { PlaneGeometry, Vector3 } from 'three';
import { SimplexNoise } from '../utils/simplex-noise';
import { log } from '../utils/logger';
import { rng } from '../utils/rng';

export interface TerrainGeometryParams {
    position?: Vector3,
    octaves?: number;
    frequency?: number;
    persistence?: number;
    amplitude?: number;
}

export class TerrainGeometry extends PlaneGeometry {
    private _octaves: number = 4;
    private _frequency: number = 0.1;
    private _persistence: number = 0.2;
    private _amplitude: number = 4.0;
    private _position: Vector3 = new Vector3();

    constructor(
        public readonly size: number = 16,
        public readonly segments: number = size,
        params?: TerrainGeometryParams,
    ) {
        size = Math.max(Math.abs(size), 1);
        segments = Math.max(Math.abs(segments), 1);

        super(size, size, segments, segments);

        this.rotateX(Math.PI * -0.5);

        this._octaves = params?.octaves ?? this._octaves;
        this._frequency = params?.frequency ?? this._frequency;
        this._persistence = params?.persistence ?? this._persistence;
        this._amplitude = params?.amplitude ?? this._amplitude;
        this._position = params?.position?.clone().floor() ?? this._position;

        this._createChunkGeometry();
    }

    private _forEachTerrainVertex(vertxCallback: (x: number, y: number, z: number) => number) {
        const vertices = this.getAttribute('position');

        if (vertices?.count) {
            for (let i = 0; i < vertices.count; i += 1) {
                const xi = i * 3;
                const yi = xi + 1;
                const zi = xi + 2;

                const x = vertices.array[xi];// + this._position.x;
                const y = vertices.array[yi];// + this._position.y;
                const z = vertices.array[zi];// + this._position.z;

                vertices.array[yi] = vertxCallback(x, y, z);
            }

            this.attributes.position.needsUpdate = true;
            this.computeVertexNormals();
        }
    }

    private _createChunkGeometry() {
        if (this.segments > 1) {
            const noise = new SimplexNoise();

            this._forEachTerrainVertex((x: number, y: number, z: number) => {
                return noise.fractalNoise3d(
                    x, y, z,
                    this._octaves,
                    this._frequency,
                    this._persistence,
                    this._amplitude,
                );
            });
        }
    }

    public get octaves(): number {
        return this._octaves;
    }

    public set octaves(value: number) {
        // this._octaves = Math.max(Math.abs(value), 1);
        this._octaves = Math.abs(value);
        this._createChunkGeometry();
    }

    public get frequency(): number {
        return this._frequency;
    }

    public set frequency(value: number) {
        // this._frequency = clamp(value, 0.1, 10.0);
        this._frequency = value;
        this._createChunkGeometry();
    }

    public get persistence(): number {
        return this._persistence;
    }

    public set persistence(value: number) {
        // this._persistence = clamp(value, 0.1, 10.0);
        this._persistence = value;
        this._createChunkGeometry();
    }

    public get amplitude(): number {
        return this._amplitude;
    }

    public set amplitude(value: number) {
        // this._amplitude = clamp(value, 0.1, 10.0);
        this._amplitude = value;
        this._createChunkGeometry();
    }

    public get position(): Vector3 {
        return this._position;
    }

    public set position(value: Vector3) {
        this._position = value.clone().floor();
        this._createChunkGeometry();
    }
}
