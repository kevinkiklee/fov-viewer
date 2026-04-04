export const compressionFragmentShader = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_color;
in vec3 v_worldPos;

uniform vec3 u_lightDir;
uniform vec3 u_cameraPos;

out vec4 fragColor;

void main() {
  vec3 normal = normalize(v_normal);
  float diffuse = max(dot(normal, normalize(u_lightDir)), 0.0);
  float ambient = 0.3;
  float lighting = ambient + diffuse * 0.7;

  float dist = length(v_worldPos - u_cameraPos);
  float fog = 1.0 - smoothstep(20.0, 60.0, dist);

  vec3 bgColor = vec3(0.08, 0.08, 0.15);
  vec3 litColor = v_color * lighting;
  vec3 finalColor = mix(bgColor, litColor, fog);

  fragColor = vec4(finalColor, 1.0);
}
`
