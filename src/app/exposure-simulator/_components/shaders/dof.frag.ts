/**
 * Depth-of-field fragment shader.
 * Performs a single-pass (horizontal or vertical) Gaussian blur weighted by a depth map.
 * Run twice (H then V) for separable 2D blur.
 */
export const dofFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform sampler2D u_depthMap;
uniform float u_focusDistance;   // 0..1 normalized depth of focus plane
uniform float u_apertureScale;  // 0..1: 0 = f/22 (no blur), 1 = f/1.4 (max blur)
uniform float u_maxRadius;      // max blur radius in pixels (e.g. 20)
uniform vec2 u_direction;       // (1/width, 0) for horizontal, (0, 1/height) for vertical
uniform vec2 u_texelSize;       // 1.0 / textureSize

const int MAX_SAMPLES = 20;

void main() {
  float depth = texture(u_depthMap, v_texCoord).r;
  float coc = abs(depth - u_focusDistance) * u_apertureScale * u_maxRadius;
  coc = min(coc, u_maxRadius);

  if (coc < 0.5) {
    fragColor = texture(u_image, v_texCoord);
    return;
  }

  int samples = int(min(coc, float(MAX_SAMPLES)));
  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  for (int i = -MAX_SAMPLES; i <= MAX_SAMPLES; i++) {
    if (abs(i) > samples) continue;
    float t = float(i);
    float weight = exp(-0.5 * (t * t) / (coc * coc * 0.25));
    vec2 offset = u_direction * t * u_texelSize;
    color += texture(u_image, v_texCoord + offset) * weight;
    totalWeight += weight;
  }

  fragColor = color / totalWeight;
}
`
