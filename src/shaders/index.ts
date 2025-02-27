import VertShader from './vertex.glsl?raw';
import FragShader from './fragment.glsl?raw';
import { clamp, Clock, CreateProgramInfo, CreateWebGlContext, Input, KeyValue, ResizeWebGlContext } from '@n3rdw1z4rd/core';

const gl = CreateWebGlContext();
document.getElementById('root')!.appendChild(gl.canvas as HTMLCanvasElement);
ResizeWebGlContext(gl);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const programInfo = CreateProgramInfo(gl, VertShader, FragShader);

gl.useProgram(programInfo.program);

const quadVertices = new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

gl.enableVertexAttribArray(programInfo.attributes['position']);
gl.vertexAttribPointer(programInfo.attributes['position'], 2, gl.FLOAT, false, 0, 0);

const clock = new Clock();

const cameraPosition: [number, number, number] = [0.0, 0.0, 1.0];
const lightDirection: [number, number, number] = [0.0, 1.0, 0.0];

const input = new Input();

input.on('mouse_wheel', (ev: KeyValue) => {
    cameraPosition[2] = clamp(cameraPosition[2] + ev.deltaY * clock.deltaTimeSeconds, 1.0, 10.0);
});

clock.run((_deltaTime: number) => {
    ResizeWebGlContext(gl);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(programInfo.uniforms['resolution'], gl.canvas.width, gl.canvas.height);
    gl.uniform3f(programInfo.uniforms['cameraPosition'], ...cameraPosition);
    gl.uniform3f(programInfo.uniforms['lightDirection'], ...lightDirection);
    gl.uniform2f(programInfo.uniforms['mousePosition'], ...input.mousePosition as [number, number]);
    gl.uniform1f(programInfo.uniforms['time'], clock.elapsedTimeSinceStart);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    clock.showStats();
});
