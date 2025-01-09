import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import './main.css';
import { Clock } from './utils';

const ROOT_DIV = document.getElementById('ROOT_DIV')!;

const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;
const WINDOW_PIXEL_RATIO = window.devicePixelRatio;

const CAMERA_FOV = 75;
const CAMERA_ASPECT = WINDOW_WIDTH / WINDOW_HEIGHT;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000.0;

const clock = new Clock();

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(WINDOW_PIXEL_RATIO);
renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

ROOT_DIV.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);
camera.position.z = 5;

const scene = new Scene();

const box = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshBasicMaterial({ color: 'red' }),
);

clock.run((deltaTime: number) => {
    renderer.render(scene, camera);

    clock.showStats();
});
