/**
 * White balance fragment shader.
 *
 * Applies color temperature by multiplying each pixel's RGB channels
 * by the normalized white balance RGB values. At 5500K (daylight),
 * the multiplier is (1,1,1) — no change. Warm temps boost red,
 * cool temps boost blue.
 */
export const wbFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec3 u_wbMultiplier;  // RGB multiplier normalized so max channel = 1.0

void main() {
  vec4 color = texture(u_image, v_texCoord);
  vec3 balanced = color.rgb * u_wbMultiplier;
  fragColor = vec4(clamp(balanced, 0.0, 1.0), color.a);
}
`
