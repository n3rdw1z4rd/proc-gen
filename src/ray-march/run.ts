import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export function createRayMarchingScene(parent: HTMLElement) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, parent.clientWidth / parent.clientHeight, 0.1, 100);
    camera.position.set(1.5, 1.5, 3.5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    parent.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(parent.clientWidth, parent.clientHeight) },
            uCameraPos: { value: camera.position }
        },
        vertexShader: `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            precision highp float;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform vec3 uCameraPos;
            
            #define MAX_STEPS 100
            #define MAX_DIST 100.0
            #define SURF_DIST 0.001
            #define GRID_SIZE 8.0
            
            float sdfBox(vec3 p, vec3 b) {
                vec3 d = abs(p) - b;
                return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
            }
            
            float sceneSDF(vec3 p) {
                vec3 gridPos = floor(p + 0.5);
                if (mod(gridPos.x + gridPos.y + gridPos.z, 2.0) < 1.0) {
                    return sdfBox(p - gridPos, vec3(0.45));
                }
                return MAX_DIST;
            }
            
            vec3 rayDirection(vec2 uv, vec3 camPos) {
                vec3 forward = normalize(-camPos);
                vec3 right = normalize(cross(vec3(0, 1, 0), forward));
                vec3 up = cross(forward, right);
                return normalize(forward + uv.x * right + uv.y * up);
            }
            
            float rayMarch(vec3 ro, vec3 rd) {
                float dO = 0.0;
                for (int i = 0; i < MAX_STEPS; i++) {
                    vec3 p = ro + rd * dO;
                    float dS = sceneSDF(p);
                    dO += dS;
                    if (dS < SURF_DIST || dO > MAX_DIST) break;
                }
                return dO;
            }
            
            void main() {
                vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
                uv.x *= uResolution.x / uResolution.y;
                
                vec3 ro = uCameraPos;
                vec3 rd = rayDirection(uv, ro);
                
                float dist = rayMarch(ro, rd);
                vec3 color = dist < MAX_DIST ? vec3(1.0, 0.5, 0.2) : vec3(0.0);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        material.uniforms.uTime.value += 0.01;
        material.uniforms.uCameraPos.value.copy(camera.position);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(parent.clientWidth, parent.clientHeight);
        camera.aspect = parent.clientWidth / parent.clientHeight;
        camera.updateProjectionMatrix();
        material.uniforms.uResolution.value.set(parent.clientWidth, parent.clientHeight);
    });
}
