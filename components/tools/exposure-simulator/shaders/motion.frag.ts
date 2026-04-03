/**
 * Motion blur fragment shader.
 * Applies directional blur to pixels marked by the motion mask.
 */
export const motionFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform sampler2D u_motionMask;
uniform float u_blurAmount;     // blur kernel size in pixels
uniform vec2 u_texelSize;       // 1.0 / textureSize

const int SAMPLES = 16;

void main() {
  float mask = texture(u_motionMask, v_texCoord).r;
  float blur = mask * u_blurAmount;

  if (blur < 0.5) {
    fragColor = texture(u_image, v_texCoord);
    return;
  }

  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  for (int i = -SAMPLES; i <= SAMPLES; i++) {
    float t = float(i) / float(SAMPLES);
    float offset = t * blur;
    vec2 sampleCoord = v_texCoord + vec2(offset * u_texelSize.x, 0.0);
    float weight = 1.0 - abs(t);
    color += texture(u_image, sampleCoord) * weight;
    totalWeight += weight;
  }

  fragColor = color / totalWeight;
}
`
