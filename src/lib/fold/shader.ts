export const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG_SRC = `
precision highp float;

uniform sampler2D uLayer;
uniform vec2 uSize;
uniform float uAngle;
uniform float uEyeDistance;
uniform float uBlurSpread;
uniform float uDarkening;

varying vec2 vUv;

const int MAX_TAPS = 16;
const float GOLDEN = 2.39996322972865332;
const float TWO_PI = 6.28318530717958648;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 sampleLayer(vec2 uv) {
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    return vec3(0.0);
  }
  return texture2D(uLayer, uv).rgb;
}

void main() {
  vec2 p = vUv * uSize;
  float tilt = abs(uAngle);

  if (tilt < 0.00001) {
    gl_FragColor = vec4(sampleLayer(vUv), 1.0);
    return;
  }

  float hingeX = uAngle > 0.0 ? uSize.x : 0.0;
  float side = uAngle > 0.0 ? -1.0 : 1.0;
  float d = abs(p.x - hingeX);

  vec3 glass = vec3(hingeX + side * d * cos(tilt), p.y, d * sin(tilt));
  vec3 eye = vec3(uSize.x * 0.5, uSize.y * 0.5, uEyeDistance);

  float depth = eye.z - glass.z;
  if (depth <= 0.001) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float tHit = eye.z / depth;
  vec2 hit = eye.xy + (glass.xy - eye.xy) * tHit;

  float gap = glass.z;
  float radius = uBlurSpread * gap;

  if (hit.x < -radius || hit.y < -radius || hit.x > uSize.x + radius || hit.y > uSize.y + radius) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float attenuation = max(1.0 - uDarkening * radius, 0.0);

  if (radius < 0.5) {
    gl_FragColor = vec4(sampleLayer(hit / uSize) * attenuation, 1.0);
    return;
  }

  float tapsF = clamp(radius * 1.35, 5.0, 16.0);
  int taps = int(tapsF);
  float rotation = hash21(p) * TWO_PI;
  vec3 sum = vec3(0.0);

  for (int i = 0; i < MAX_TAPS; i++) {
    if (i >= taps) break;
    float r = radius * sqrt((float(i) + 0.5) / tapsF);
    float a = float(i) * GOLDEN + rotation;
    vec2 offset = r * vec2(cos(a), sin(a));
    sum += sampleLayer((hit + offset) / uSize);
  }

  gl_FragColor = vec4(sum / tapsF * attenuation, 1.0);
}
`;
