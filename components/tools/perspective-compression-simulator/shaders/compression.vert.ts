export const compressionVertexShader = `#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec3 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;

out vec3 v_normal;
out vec3 v_color;
out vec3 v_worldPos;

void main() {
  v_worldPos = a_position;
  v_normal = a_normal;
  v_color = a_color;
  gl_Position = u_projection * u_view * vec4(a_position, 1.0);
}
`
