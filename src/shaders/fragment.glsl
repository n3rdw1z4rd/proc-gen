#version 300 es
precision highp float;

out vec4 outColor;

in vec2 uv;

uniform vec2 resolution;
uniform vec3 cameraPosition;
uniform vec3 lightDirection;
uniform vec3 mousePosition;
uniform float time;

const int MAX_STEPS = 100;
const float MAX_DIST = 100.0f;
const float SURFACE_DIST = 0.001f;

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

vec3 getRayDirection(vec2 uv, vec3 camPos) {
    vec3 forward = normalize(vec3(0.0f, 0.0f, -1.0f));
    vec3 right = normalize(cross(vec3(0.0f, 1.0f, 0.0f), forward));
    vec3 up = cross(forward, right);

    return normalize(uv.x * right + uv.y * up + forward);
}

float rayMarch(vec3 cameraPosition, vec3 rd) {
    float dist = 0.0f;

    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = cameraPosition + rd * dist;
        float d = sdSphere(p, 0.5f);

        if(d < SURFACE_DIST) {
            return dist;
        }

        if(dist > MAX_DIST) {
            break;
        }

        dist += d;
    }

    return -1.0f;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001f, 0.0f);
    return normalize(vec3(sdSphere(p + e.xyy, 0.5f) - sdSphere(p - e.xyy, 0.5f), sdSphere(p + e.yxy, 0.5f) - sdSphere(p - e.yxy, 0.5f), sdSphere(p + e.yyx, 0.5f) - sdSphere(p - e.yyx, 0.5f)));
}

void main() {
    vec2 uv = uv * 2.0f - 1.0f;  // Convert to range (-1, 1)
    uv.x *= resolution.x / resolution.y; // Aspect ratio correction

    vec3 rayDirection = getRayDirection(uv, cameraPosition);

    float dist = rayMarch(cameraPosition, rayDirection);

    if(dist > 0.0f) {
        vec3 p = cameraPosition + rayDirection * dist;
        vec3 normal = getNormal(p);
        float diff = max(dot(normal, normalize(lightDirection)), 0.0f);

        outColor = vec4(vec3(0.8f, 0.2f, 0.2f) * diff + 0.1f, 1.0f);
    } else {
        outColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    }
}