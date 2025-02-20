#version 300 es
precision highp float;

in vec2 position;
out vec2 uv;

void main() {
    uv = position * 0.5f + 0.5f; // Convert from clip space (-1 to 1) to UV space (0 to 1)
    gl_Position = vec4(position, 0.0f, 1.0f);
}