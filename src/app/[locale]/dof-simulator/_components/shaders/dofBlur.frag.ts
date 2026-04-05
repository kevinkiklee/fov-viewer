/**
 * Depth-of-field blur fragment shader for the DOF Simulator.
 *
 * Performs a single-axis (horizontal or vertical) variable-radius Gaussian blur
 * driven by a per-pixel depth map. Run twice (H then V) for separable 2D blur.
 *
 * Depth map convention: white (1.0) = nearDistance, black (0.0) = farDistance.
 * The shader converts depth-map values to world distances, then computes the
 * physically-based circle of confusion for each pixel.
 */
export const dofBlurFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;        // scene photo (or intermediate framebuffer)
uniform sampler2D u_depthMap;     // grayscale depth map
uniform float u_focalLength;      // mm
uniform float u_aperture;         // f-number
uniform float u_subjectDistance;   // meters
uniform float u_sensorWidth;      // mm
uniform float u_nearDistance;      // scene near plane (meters) — maps to white
uniform float u_farDistance;       // scene far plane (meters)  — maps to black
uniform float u_maxRadius;        // max blur radius in pixels
uniform vec2 u_direction;         // blur direction: (1,0) H or (0,1) V
uniform vec2 u_texelSize;         // 1.0 / textureSize
uniform bool u_useDiffraction;    // apply Airy disk lower bound

const int MAX_SAMPLES = 20;

void main() {
  // 1. Sample depth and convert to world distance
  float depth01 = texture(u_depthMap, v_texCoord).r;
  float distance = mix(u_farDistance, u_nearDistance, depth01);

  // 2. Convert to mm for thin-lens formula
  float s = u_subjectDistance * 1000.0;  // subject distance in mm
  float d = distance * 1000.0;           // pixel distance in mm
  float f = u_focalLength;               // focal length in mm

  // 3. Geometric circle of confusion
  float blurMm;
  if (d > s) {
    // Behind focus plane
    blurMm = abs(f / u_aperture * (s / (s - f) * ((d - f) / d) - 1.0));
  } else {
    // In front of focus plane
    blurMm = abs(f / u_aperture * (1.0 - s / (s - f) * ((d - f) / d)));
  }

  // 4. Diffraction limit (Airy disk diameter)
  if (u_useDiffraction) {
    float airyMm = 2.44 * 0.00055 * u_aperture;
    blurMm = max(blurMm, airyMm);
  }

  // 5. Convert CoC from mm on sensor to pixels
  float imageWidth = float(textureSize(u_image, 0).x);
  float cocPixels = blurMm / u_sensorWidth * imageWidth;
  cocPixels = min(cocPixels, u_maxRadius);

  // 6. Sharp pixel — skip blur
  if (cocPixels < 0.5) {
    fragColor = texture(u_image, v_texCoord);
    return;
  }

  // 7. Variable-radius Gaussian blur in u_direction
  int samples = int(min(cocPixels, float(MAX_SAMPLES)));
  float sigma = cocPixels * 0.5;
  float invTwoSigmaSq = 0.5 / (sigma * sigma);

  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  for (int i = -MAX_SAMPLES; i <= MAX_SAMPLES; i++) {
    if (abs(i) > samples) continue;
    float t = float(i);
    float weight = exp(-t * t * invTwoSigmaSq);
    vec2 offset = u_direction * t * u_texelSize;
    color += texture(u_image, v_texCoord + offset) * weight;
    totalWeight += weight;
  }

  fragColor = color / totalWeight;
}
`
