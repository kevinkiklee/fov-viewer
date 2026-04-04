/**
 * Noise/grain fragment shader.
 * Adds procedural film grain scaled by ISO.
 */
export const noiseFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_noiseAmplitude;  // 0 = clean (ISO 100), ~0.5 = heavy (ISO 25600)
uniform float u_seed;            // random seed per render

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec4 color = texture(u_image, v_texCoord);

  if (u_noiseAmplitude < 0.001) {
    fragColor = color;
    return;
  }

  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float shadowWeight = 1.0 - luminance * 0.3;

  float lumNoise = (hash(v_texCoord * 1000.0 + u_seed) - 0.5) * 2.0;
  lumNoise *= u_noiseAmplitude * shadowWeight;

  float chrR = (hash(v_texCoord * 1000.0 + u_seed + 1.0) - 0.5) * u_noiseAmplitude * 0.5;
  float chrG = (hash(v_texCoord * 1000.0 + u_seed + 2.0) - 0.5) * u_noiseAmplitude * 0.5;
  float chrB = (hash(v_texCoord * 1000.0 + u_seed + 3.0) - 0.5) * u_noiseAmplitude * 0.5;

  vec3 noisy = color.rgb + lumNoise + vec3(chrR, chrG, chrB) * shadowWeight;
  fragColor = vec4(clamp(noisy, 0.0, 1.0), color.a);
}
`
