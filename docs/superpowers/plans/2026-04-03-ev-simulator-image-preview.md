# EV Simulator Image Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time WebGL image preview to the Exposure Triangle Simulator that visualizes depth-of-field, motion blur, and noise effects as users adjust aperture, shutter speed, and ISO sliders.

**Architecture:** Multi-pass WebGL2 shader pipeline on the frontend. Each scene ships with a base photo, depth map, and motion mask. The shader applies DOF blur (weighted by depth map), directional motion blur (weighted by motion mask), and procedural noise (scaled by ISO). Layout refactored from 2-column grid to FOV-Viewer-style sidebar + canvas.

**Tech Stack:** WebGL2, GLSL shaders (as TypeScript string exports), React hooks, CSS Modules, Next.js App Router

**Spec:** `docs/superpowers/specs/2026-04-03-ev-simulator-image-preview-design.md`

---

## File Structure

```
components/tools/exposure-simulator/
├── ExposureSimulator.tsx          MODIFY - refactor layout to sidebar + canvas
├── ExposureSimulator.module.css   MODIFY - rewrite for FOV-Viewer-style layout
├── ExposurePreview.tsx            CREATE - WebGL canvas + scene selector component
├── ExposurePreview.module.css     CREATE - canvas area + scene strip styles
├── shaders/
│   ├── passthrough.vert.ts        CREATE - shared vertex shader
│   ├── dof.frag.ts                CREATE - depth-of-field fragment shader
│   ├── motion.frag.ts             CREATE - motion blur fragment shader
│   └── noise.frag.ts              CREATE - noise/grain fragment shader
└── useExposureRenderer.ts         CREATE - WebGL setup, texture loading, render loop

lib/math/exposure.ts               MODIFY - add pure functions for shader math
lib/math/exposure.test.ts           MODIFY - add tests for new shader math functions

public/images/exposure-simulator/   CREATE - 12 image assets (4 scenes × 3 each)
```

---

### Task 1: Add Shader Math Functions to exposure.ts (TDD)

**Files:**
- Test: `lib/math/exposure.test.ts`
- Modify: `lib/math/exposure.ts`

These pure functions mirror the shader logic so they can be unit-tested independently.

- [ ] **Step 1: Write failing tests for `calcCircleOfConfusion`**

Add to `lib/math/exposure.test.ts`:

```typescript
import { calcCircleOfConfusion, calcMotionBlurAmount, calcNoiseAmplitude } from './exposure'

describe('calcCircleOfConfusion', () => {
  it('returns 0 at the focus distance', () => {
    expect(calcCircleOfConfusion(0.3, 0.3, 1.4)).toBe(0)
  })

  it('returns larger CoC for wider apertures', () => {
    const cocWide = calcCircleOfConfusion(0.8, 0.3, 1.4)
    const cocNarrow = calcCircleOfConfusion(0.8, 0.3, 22)
    expect(cocWide).toBeGreaterThan(cocNarrow)
  })

  it('returns larger CoC for points further from focus', () => {
    const cocNear = calcCircleOfConfusion(0.4, 0.3, 5.6)
    const cocFar = calcCircleOfConfusion(0.9, 0.3, 5.6)
    expect(cocFar).toBeGreaterThan(cocNear)
  })

  it('returns 0 for f/22 regardless of depth (near-zero blur)', () => {
    const coc = calcCircleOfConfusion(0.8, 0.3, 22)
    expect(coc).toBeLessThan(0.01)
  })

  it('clamps to maxRadius', () => {
    const coc = calcCircleOfConfusion(1.0, 0.3, 1.4)
    expect(coc).toBeLessThanOrEqual(20)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run lib/math/exposure.test.ts`
Expected: FAIL — `calcCircleOfConfusion` is not exported

- [ ] **Step 3: Implement `calcCircleOfConfusion`**

Add to `lib/math/exposure.ts`:

```typescript
/**
 * Calculate the circle of confusion (blur radius) for a point at a given depth.
 *
 * Models how out-of-focus a point is based on its distance from the focus plane
 * and the aperture. Used by the DOF shader to determine per-pixel blur amount.
 *
 * @param depth - Normalized depth of the point (0=near, 1=far)
 * @param focusDistance - Normalized focus distance (0=near, 1=far)
 * @param aperture - F-number (1.4 to 22)
 * @param maxRadius - Maximum blur radius in pixels (default 20)
 * @returns Blur radius in pixels, clamped to [0, maxRadius]
 */
export function calcCircleOfConfusion(
  depth: number,
  focusDistance: number,
  aperture: number,
  maxRadius: number = 20
): number {
  // apertureScale: f/1.4 → 1.0, f/22 → ~0.0 (logarithmic mapping)
  const maxAperture = 1.4
  const minAperture = 22
  const apertureScale = 1.0 - Math.log2(aperture / maxAperture) / Math.log2(minAperture / maxAperture)
  const coc = Math.abs(depth - focusDistance) * apertureScale * maxRadius
  return Math.min(Math.max(coc, 0), maxRadius)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run lib/math/exposure.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing tests for `calcMotionBlurAmount`**

Add to `lib/math/exposure.test.ts`:

```typescript
describe('calcMotionBlurAmount', () => {
  it('returns 0 for very fast shutter speeds', () => {
    expect(calcMotionBlurAmount(1/8000)).toBeLessThan(0.5)
  })

  it('returns max blur for 30s exposure', () => {
    expect(calcMotionBlurAmount(30)).toBe(40)
  })

  it('returns more blur for slower shutters', () => {
    const blurFast = calcMotionBlurAmount(1/1000)
    const blurSlow = calcMotionBlurAmount(1/30)
    expect(blurSlow).toBeGreaterThan(blurFast)
  })

  it('clamps to maxBlur', () => {
    expect(calcMotionBlurAmount(30, 40)).toBeLessThanOrEqual(40)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- --run lib/math/exposure.test.ts`
Expected: FAIL — `calcMotionBlurAmount` is not exported

- [ ] **Step 7: Implement `calcMotionBlurAmount`**

Add to `lib/math/exposure.ts`:

```typescript
/**
 * Calculate motion blur kernel size based on shutter speed.
 *
 * Maps shutter speed to a blur amount in pixels. Longer exposures produce
 * more motion blur on masked regions. The motion mask determines which
 * pixels are affected.
 *
 * @param shutterSpeed - Shutter speed in seconds
 * @param maxBlur - Maximum blur in pixels (default 40)
 * @returns Blur amount in pixels, clamped to [0, maxBlur]
 */
export function calcMotionBlurAmount(shutterSpeed: number, maxBlur: number = 40): number {
  // Map shutter speed logarithmically: 1/8000 → ~0, 30s → maxBlur
  // Using log scale since shutter speeds are exponential
  const minShutter = 1 / 8000
  const maxShutter = 30
  const logMin = Math.log2(minShutter)
  const logMax = Math.log2(maxShutter)
  const logCurrent = Math.log2(Math.max(shutterSpeed, minShutter))
  const t = (logCurrent - logMin) / (logMax - logMin)
  return Math.min(Math.max(t * maxBlur, 0), maxBlur)
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- --run lib/math/exposure.test.ts`
Expected: PASS

- [ ] **Step 9: Write failing tests for `calcNoiseAmplitude`**

Add to `lib/math/exposure.test.ts`:

```typescript
describe('calcNoiseAmplitude', () => {
  it('returns 0 at ISO 100', () => {
    expect(calcNoiseAmplitude(100)).toBe(0)
  })

  it('returns small value at ISO 200', () => {
    const amp = calcNoiseAmplitude(200)
    expect(amp).toBeGreaterThan(0)
    expect(amp).toBeLessThan(0.1)
  })

  it('increases with ISO', () => {
    const amp400 = calcNoiseAmplitude(400)
    const amp3200 = calcNoiseAmplitude(3200)
    const amp25600 = calcNoiseAmplitude(25600)
    expect(amp3200).toBeGreaterThan(amp400)
    expect(amp25600).toBeGreaterThan(amp3200)
  })

  it('returns max amplitude at ISO 25600', () => {
    const amp = calcNoiseAmplitude(25600)
    expect(amp).toBeCloseTo(0.5, 1) // heavy but not overwhelming
  })
})
```

- [ ] **Step 10: Run test to verify it fails**

Run: `npm test -- --run lib/math/exposure.test.ts`
Expected: FAIL — `calcNoiseAmplitude` is not exported

- [ ] **Step 11: Implement `calcNoiseAmplitude`**

Add to `lib/math/exposure.ts`:

```typescript
/**
 * Calculate noise amplitude based on ISO value.
 *
 * Models sensor noise that increases logarithmically with ISO.
 * At ISO 100, noise is zero. At ISO 25600, noise is at maximum (~0.5).
 *
 * @param iso - ISO sensitivity (100 to 25600)
 * @returns Noise amplitude (0 to ~0.5)
 */
export function calcNoiseAmplitude(iso: number): number {
  if (iso <= 100) return 0
  // log2(25600/100) = ~8, so divide by 16 to get max ~0.5
  return Math.log2(iso / 100) / 16
}
```

- [ ] **Step 12: Run test to verify it passes**

Run: `npm test -- --run lib/math/exposure.test.ts`
Expected: PASS

- [ ] **Step 13: Run full test suite**

Run: `npm test -- --run`
Expected: All tests pass (existing + new)

- [ ] **Step 14: Commit**

```bash
git add lib/math/exposure.ts lib/math/exposure.test.ts
git commit -m "feat(exposure): add shader math functions for DOF, motion blur, and noise"
```

---

### Task 2: Create GLSL Shaders

**Files:**
- Create: `components/tools/exposure-simulator/shaders/passthrough.vert.ts`
- Create: `components/tools/exposure-simulator/shaders/dof.frag.ts`
- Create: `components/tools/exposure-simulator/shaders/motion.frag.ts`
- Create: `components/tools/exposure-simulator/shaders/noise.frag.ts`

Each shader is exported as a string constant from a TypeScript file.

- [ ] **Step 1: Create the passthrough vertex shader**

Create `components/tools/exposure-simulator/shaders/passthrough.vert.ts`:

```typescript
/** Passthrough vertex shader — renders a full-screen quad with texture coordinates. */
export const passthroughVertexShader = `#version 300 es
precision highp float;

in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`
```

- [ ] **Step 2: Create the DOF fragment shader**

Create `components/tools/exposure-simulator/shaders/dof.frag.ts`:

```typescript
/**
 * Depth-of-field fragment shader.
 *
 * Performs a single-pass (horizontal or vertical) Gaussian blur weighted by a depth map.
 * Run twice (H then V) for separable 2D blur. The blur radius per pixel is determined
 * by how far it is from the focus distance, scaled by aperture.
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
```

- [ ] **Step 3: Create the motion blur fragment shader**

Create `components/tools/exposure-simulator/shaders/motion.frag.ts`:

```typescript
/**
 * Motion blur fragment shader.
 *
 * Applies directional blur to pixels marked by the motion mask.
 * White regions in the mask get full blur, black regions stay sharp.
 * Blur direction is horizontal (simulating walking/moving subjects).
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
    // Horizontal motion direction
    vec2 sampleCoord = v_texCoord + vec2(offset * u_texelSize.x, 0.0);
    float weight = 1.0 - abs(t); // triangle kernel
    color += texture(u_image, sampleCoord) * weight;
    totalWeight += weight;
  }

  fragColor = color / totalWeight;
}
`
```

- [ ] **Step 4: Create the noise fragment shader**

Create `components/tools/exposure-simulator/shaders/noise.frag.ts`:

```typescript
/**
 * Noise/grain fragment shader.
 *
 * Adds procedural film grain scaled by ISO. Includes both luminance
 * and chrominance noise, with more noise in shadow regions.
 */
export const noiseFragmentShader = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_noiseAmplitude;  // 0 = clean (ISO 100), ~0.5 = heavy (ISO 25600)
uniform float u_seed;            // random seed per render to vary grain pattern

// Pseudo-random hash
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

  // Luminance of the pixel (for shadow-weighted noise)
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  // Shadow weighting: more noise in darker regions
  float shadowWeight = 1.0 - luminance * 0.3;

  // Luminance noise (same for all channels)
  float lumNoise = (hash(v_texCoord * 1000.0 + u_seed) - 0.5) * 2.0;
  lumNoise *= u_noiseAmplitude * shadowWeight;

  // Chrominance noise (different per channel, at half strength)
  float chrR = (hash(v_texCoord * 1000.0 + u_seed + 1.0) - 0.5) * u_noiseAmplitude * 0.5;
  float chrG = (hash(v_texCoord * 1000.0 + u_seed + 2.0) - 0.5) * u_noiseAmplitude * 0.5;
  float chrB = (hash(v_texCoord * 1000.0 + u_seed + 3.0) - 0.5) * u_noiseAmplitude * 0.5;

  vec3 noisy = color.rgb + lumNoise + vec3(chrR, chrG, chrB) * shadowWeight;
  fragColor = vec4(clamp(noisy, 0.0, 1.0), color.a);
}
`
```

- [ ] **Step 5: Commit**

```bash
git add components/tools/exposure-simulator/shaders/
git commit -m "feat(exposure): add WebGL shaders for DOF, motion blur, and noise"
```

---

### Task 3: Create the WebGL Renderer Hook

**Files:**
- Create: `components/tools/exposure-simulator/useExposureRenderer.ts`

This hook manages the entire WebGL lifecycle: context, shaders, textures, framebuffers, and the multi-pass render pipeline.

- [ ] **Step 1: Create `useExposureRenderer.ts`**

Create `components/tools/exposure-simulator/useExposureRenderer.ts`:

```typescript
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { passthroughVertexShader } from './shaders/passthrough.vert'
import { dofFragmentShader } from './shaders/dof.frag'
import { motionFragmentShader } from './shaders/motion.frag'
import { noiseFragmentShader } from './shaders/noise.frag'
import { calcCircleOfConfusion, calcMotionBlurAmount, calcNoiseAmplitude } from '@/lib/math/exposure'

export interface SceneAssets {
  photo: string
  depthMap: string
  motionMask: string
}

interface GLResources {
  gl: WebGL2RenderingContext
  dofProgram: WebGLProgram
  motionProgram: WebGLProgram
  noiseProgram: WebGLProgram
  vao: WebGLVertexArrayObject
  framebufferA: WebGLFramebuffer
  framebufferB: WebGLFramebuffer
  textureA: WebGLTexture
  textureB: WebGLTexture
  photoTexture: WebGLTexture
  depthTexture: WebGLTexture
  motionTexture: WebGLTexture
  width: number
  height: number
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()!
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${info}`)
  }
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  return program
}

function createFramebuffer(gl: WebGL2RenderingContext, width: number, height: number): { fb: WebGLFramebuffer; tex: WebGLTexture } {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const fb = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return { fb, tex }
}

function loadImageAsTexture(gl: WebGL2RenderingContext, src: string): Promise<{ texture: WebGLTexture; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      resolve({ texture, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function setupFullScreenQuad(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()!
  gl.bindVertexArray(vao)

  // Full-screen quad: two triangles covering clip space
  const positions = new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ])
  const texCoords = new Float32Array([
    0, 0,  1, 0,  0, 1,
    0, 1,  1, 0,  1, 1,
  ])

  const posBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  const posLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  const texBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuf)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
  const texLoc = gl.getAttribLocation(program, 'a_texCoord')
  gl.enableVertexAttribArray(texLoc)
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0)

  gl.bindVertexArray(null)
  return vao
}

export function useExposureRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  scene: SceneAssets | null,
  aperture: number,
  shutterSpeed: number,
  iso: number
): { isLoading: boolean; error: string | null } {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const resourcesRef = useRef<GLResources | null>(null)
  const sceneRef = useRef<string | null>(null)

  // Initialize WebGL context and compile shaders (once on mount)
  const initGL = useCallback((canvas: HTMLCanvasElement): GLResources | null => {
    const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: false })
    if (!gl) {
      setError('WebGL2 is not supported by your browser.')
      return null
    }

    const dofProgram = createProgram(gl, passthroughVertexShader, dofFragmentShader)
    const motionProgram = createProgram(gl, passthroughVertexShader, motionFragmentShader)
    const noiseProgram = createProgram(gl, passthroughVertexShader, noiseFragmentShader)
    const vao = setupFullScreenQuad(gl, dofProgram)

    // Bind same VAO for all programs (they share the same vertex layout)
    // Re-bind attribs for motion and noise programs
    gl.bindVertexArray(vao)
    for (const prog of [motionProgram, noiseProgram]) {
      const posLoc = gl.getAttribLocation(prog, 'a_position')
      const texLoc = gl.getAttribLocation(prog, 'a_texCoord')
      if (posLoc >= 0) gl.enableVertexAttribArray(posLoc)
      if (texLoc >= 0) gl.enableVertexAttribArray(texLoc)
    }
    gl.bindVertexArray(null)

    return {
      gl, dofProgram, motionProgram, noiseProgram, vao,
      framebufferA: null!, framebufferB: null!,
      textureA: null!, textureB: null!,
      photoTexture: null!, depthTexture: null!, motionTexture: null!,
      width: 0, height: 0,
    }
  }, [])

  // Load scene textures and resize framebuffers
  useEffect(() => {
    if (!canvasRef.current || !scene) return

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      let resources = resourcesRef.current
      if (!resources) {
        resources = initGL(canvasRef.current!)
        if (!resources) return
        resourcesRef.current = resources
      }

      // Skip reload if same scene
      if (sceneRef.current === scene.photo) {
        setIsLoading(false)
        return
      }

      const { gl } = resources

      try {
        const [photoResult, depthResult, motionResult] = await Promise.all([
          loadImageAsTexture(gl, scene.photo),
          loadImageAsTexture(gl, scene.depthMap),
          loadImageAsTexture(gl, scene.motionMask),
        ])

        if (cancelled) return

        // Clean up old textures
        if (resources.photoTexture) gl.deleteTexture(resources.photoTexture)
        if (resources.depthTexture) gl.deleteTexture(resources.depthTexture)
        if (resources.motionTexture) gl.deleteTexture(resources.motionTexture)

        resources.photoTexture = photoResult.texture
        resources.depthTexture = depthResult.texture
        resources.motionTexture = motionResult.texture

        // Resize canvas and framebuffers to match photo
        const canvas = canvasRef.current!
        canvas.width = photoResult.width
        canvas.height = photoResult.height
        resources.width = photoResult.width
        resources.height = photoResult.height

        // Recreate framebuffers
        if (resources.framebufferA) gl.deleteFramebuffer(resources.framebufferA)
        if (resources.framebufferB) gl.deleteFramebuffer(resources.framebufferB)
        if (resources.textureA) gl.deleteTexture(resources.textureA)
        if (resources.textureB) gl.deleteTexture(resources.textureB)

        const fbA = createFramebuffer(gl, photoResult.width, photoResult.height)
        const fbB = createFramebuffer(gl, photoResult.width, photoResult.height)
        resources.framebufferA = fbA.fb
        resources.textureA = fbA.tex
        resources.framebufferB = fbB.fb
        resources.textureB = fbB.tex

        sceneRef.current = scene.photo
        setIsLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load scene')
          setIsLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [canvasRef, scene, initGL])

  // Render pipeline — runs on every parameter change
  useEffect(() => {
    const resources = resourcesRef.current
    if (!resources || !resources.photoTexture || isLoading) return

    const { gl, dofProgram, motionProgram, noiseProgram, vao,
            framebufferA, framebufferB, textureA, textureB,
            photoTexture, depthTexture, motionTexture, width, height } = resources

    gl.viewport(0, 0, width, height)
    gl.bindVertexArray(vao)

    const texelSize = [1.0 / width, 1.0 / height]
    const focusDistance = 0.3
    const maxAperture = 1.4
    const minAperture = 22
    const apertureScale = Math.max(0, 1.0 - Math.log2(aperture / maxAperture) / Math.log2(minAperture / maxAperture))
    const motionBlur = calcMotionBlurAmount(shutterSpeed)
    const noiseAmp = calcNoiseAmplitude(iso)

    // === Pass 1: DOF horizontal blur (photo → framebuffer A) ===
    gl.useProgram(dofProgram)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferA)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, photoTexture)
    gl.uniform1i(gl.getUniformLocation(dofProgram, 'u_image'), 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
    gl.uniform1i(gl.getUniformLocation(dofProgram, 'u_depthMap'), 1)

    gl.uniform1f(gl.getUniformLocation(dofProgram, 'u_focusDistance'), focusDistance)
    gl.uniform1f(gl.getUniformLocation(dofProgram, 'u_apertureScale'), apertureScale)
    gl.uniform1f(gl.getUniformLocation(dofProgram, 'u_maxRadius'), 20.0)
    gl.uniform2f(gl.getUniformLocation(dofProgram, 'u_direction'), 1.0, 0.0)
    gl.uniform2f(gl.getUniformLocation(dofProgram, 'u_texelSize'), texelSize[0], texelSize[1])

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // === Pass 2: DOF vertical blur (framebuffer A → framebuffer B) ===
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferB)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureA)

    gl.uniform2f(gl.getUniformLocation(dofProgram, 'u_direction'), 0.0, 1.0)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // === Pass 3: Motion blur (framebuffer B → framebuffer A) ===
    gl.useProgram(motionProgram)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferA)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureB)
    gl.uniform1i(gl.getUniformLocation(motionProgram, 'u_image'), 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, motionTexture)
    gl.uniform1i(gl.getUniformLocation(motionProgram, 'u_motionMask'), 1)

    gl.uniform1f(gl.getUniformLocation(motionProgram, 'u_blurAmount'), motionBlur)
    gl.uniform2f(gl.getUniformLocation(motionProgram, 'u_texelSize'), texelSize[0], texelSize[1])

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // === Pass 4: Noise (framebuffer A → screen) ===
    gl.useProgram(noiseProgram)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureA)
    gl.uniform1i(gl.getUniformLocation(noiseProgram, 'u_image'), 0)

    gl.uniform1f(gl.getUniformLocation(noiseProgram, 'u_noiseAmplitude'), noiseAmp)
    gl.uniform1f(gl.getUniformLocation(noiseProgram, 'u_seed'), Math.random() * 1000)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    gl.bindVertexArray(null)
  }, [aperture, shutterSpeed, iso, isLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const resources = resourcesRef.current
      if (!resources) return
      const { gl } = resources
      gl.deleteProgram(resources.dofProgram)
      gl.deleteProgram(resources.motionProgram)
      gl.deleteProgram(resources.noiseProgram)
      gl.deleteVertexArray(resources.vao)
      if (resources.framebufferA) gl.deleteFramebuffer(resources.framebufferA)
      if (resources.framebufferB) gl.deleteFramebuffer(resources.framebufferB)
      if (resources.textureA) gl.deleteTexture(resources.textureA)
      if (resources.textureB) gl.deleteTexture(resources.textureB)
      if (resources.photoTexture) gl.deleteTexture(resources.photoTexture)
      if (resources.depthTexture) gl.deleteTexture(resources.depthTexture)
      if (resources.motionTexture) gl.deleteTexture(resources.motionTexture)
      resourcesRef.current = null
    }
  }, [])

  return { isLoading, error }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/tools/exposure-simulator/useExposureRenderer.ts
git commit -m "feat(exposure): add WebGL renderer hook for multi-pass shader pipeline"
```

---

### Task 4: Create Placeholder Image Assets

**Files:**
- Create: `public/images/exposure-simulator/` directory with 12 files

We need placeholder images initially. These will be replaced with real Unsplash photos + hand-painted depth/motion maps. For now, create simple programmatic placeholders so the pipeline is testable end-to-end.

- [ ] **Step 1: Create a script to generate placeholder assets**

Create `scripts/generate-ev-placeholders.mjs`:

```javascript
/**
 * Generate placeholder images for the EV simulator.
 * Creates a base photo (colored gradient), depth map (gradient), and motion mask
 * for each of the 4 scenes. Run with: node scripts/generate-ev-placeholders.mjs
 *
 * These are temporary — replace with real Unsplash photos + painted maps.
 */
import { createCanvas } from 'canvas'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const WIDTH = 1200
const HEIGHT = 800
const OUT = join(import.meta.dirname, '..', 'public', 'images', 'exposure-simulator')

mkdirSync(OUT, { recursive: true })

const scenes = [
  { name: 'street', bgColor: '#2a2a3e', fgColor: '#5a7a9a' },
  { name: 'landscape', bgColor: '#1a3a2a', fgColor: '#4a8a5a' },
  { name: 'portrait', bgColor: '#3a2a2a', fgColor: '#9a6a5a' },
  { name: 'lowlight', bgColor: '#0a0a1e', fgColor: '#3a3a5e' },
]

for (const scene of scenes) {
  // Base photo: gradient with a rectangle "subject" in the center
  const photoCanvas = createCanvas(WIDTH, HEIGHT)
  const pCtx = photoCanvas.getContext('2d')
  const grad = pCtx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  grad.addColorStop(0, scene.bgColor)
  grad.addColorStop(1, scene.fgColor)
  pCtx.fillStyle = grad
  pCtx.fillRect(0, 0, WIDTH, HEIGHT)
  // Subject rectangle
  pCtx.fillStyle = '#ffffff40'
  pCtx.fillRect(WIDTH * 0.35, HEIGHT * 0.2, WIDTH * 0.3, HEIGHT * 0.6)
  // Label
  pCtx.fillStyle = '#ffffff80'
  pCtx.font = '48px sans-serif'
  pCtx.textAlign = 'center'
  pCtx.fillText(scene.name.toUpperCase(), WIDTH / 2, HEIGHT / 2)
  writeFileSync(join(OUT, `${scene.name}.jpg`), photoCanvas.toBuffer('image/jpeg', { quality: 0.85 }))

  // Depth map: subject area is near (white), edges are far (black)
  const depthCanvas = createCanvas(WIDTH, HEIGHT)
  const dCtx = depthCanvas.getContext('2d')
  const dGrad = dCtx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, WIDTH / 2)
  dGrad.addColorStop(0, '#ffffff')
  dGrad.addColorStop(0.3, '#cccccc')
  dGrad.addColorStop(1, '#000000')
  dCtx.fillStyle = dGrad
  dCtx.fillRect(0, 0, WIDTH, HEIGHT)
  writeFileSync(join(OUT, `${scene.name}-depth.png`), depthCanvas.toBuffer('image/png'))

  // Motion mask: vertical stripe in center (moving subject)
  const motionCanvas = createCanvas(WIDTH, HEIGHT)
  const mCtx = motionCanvas.getContext('2d')
  mCtx.fillStyle = '#000000'
  mCtx.fillRect(0, 0, WIDTH, HEIGHT)
  // Moving subject stripe
  mCtx.fillStyle = '#ffffff'
  mCtx.fillRect(WIDTH * 0.4, HEIGHT * 0.1, WIDTH * 0.2, HEIGHT * 0.8)
  // Feather edges with gradient
  const leftGrad = mCtx.createLinearGradient(WIDTH * 0.35, 0, WIDTH * 0.4, 0)
  leftGrad.addColorStop(0, '#000000')
  leftGrad.addColorStop(1, '#ffffff')
  mCtx.fillStyle = leftGrad
  mCtx.fillRect(WIDTH * 0.35, HEIGHT * 0.1, WIDTH * 0.05, HEIGHT * 0.8)
  const rightGrad = mCtx.createLinearGradient(WIDTH * 0.6, 0, WIDTH * 0.65, 0)
  rightGrad.addColorStop(0, '#ffffff')
  rightGrad.addColorStop(1, '#000000')
  mCtx.fillStyle = rightGrad
  mCtx.fillRect(WIDTH * 0.6, HEIGHT * 0.1, WIDTH * 0.05, HEIGHT * 0.8)
  writeFileSync(join(OUT, `${scene.name}-motion.png`), motionCanvas.toBuffer('image/png'))
}

console.log(`Generated ${scenes.length * 3} placeholder images in ${OUT}`)
```

- [ ] **Step 2: Install the `canvas` npm package (dev dependency) and run the script**

Run:
```bash
npm install --save-dev canvas && node scripts/generate-ev-placeholders.mjs
```
Expected: "Generated 12 placeholder images in .../public/images/exposure-simulator"

- [ ] **Step 3: Verify the files exist**

Run: `ls public/images/exposure-simulator/`
Expected: 12 files (street.jpg, street-depth.png, street-motion.png, landscape.jpg, etc.)

- [ ] **Step 4: Commit**

```bash
git add public/images/exposure-simulator/ scripts/generate-ev-placeholders.mjs
git commit -m "feat(exposure): add placeholder scene assets and generation script"
```

---

### Task 5: Create ExposurePreview Component

**Files:**
- Create: `components/tools/exposure-simulator/ExposurePreview.tsx`
- Create: `components/tools/exposure-simulator/ExposurePreview.module.css`

This component renders the scene strip (image selector) and the WebGL canvas.

- [ ] **Step 1: Create `ExposurePreview.module.css`**

Create `components/tools/exposure-simulator/ExposurePreview.module.css`:

```css
/* Matches FOV Viewer's canvas area styling */
.canvasArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.topbar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  gap: 8px;
}

.sceneStrip {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
}

.sceneStripLabel {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.sceneThumb {
  width: 48px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: none;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s, border-color 0.15s;
}

.sceneThumb:hover {
  opacity: 1;
}

.sceneThumbActive {
  border-color: var(--accent);
  opacity: 1;
}

.sceneThumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.canvasMain {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 0;
  overflow: hidden;
}

.canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
}

.fallbackImg {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  opacity: 0.7;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Mobile */
@media (max-width: 1023px) {
  .topbar {
    justify-content: center;
  }

  .canvasMain {
    padding: 4px;
    flex: none;
  }

  .canvas {
    border-radius: 0;
  }

  .sceneStrip {
    justify-content: flex-start;
    padding-bottom: 4px;
  }
}
```

- [ ] **Step 2: Create `ExposurePreview.tsx`**

Create `components/tools/exposure-simulator/ExposurePreview.tsx`:

```typescript
'use client'

import { useState, useRef } from 'react'
import { useExposureRenderer, type SceneAssets } from './useExposureRenderer'
import styles from './ExposurePreview.module.css'

const SCENES: { id: string; label: string; assets: SceneAssets }[] = [
  {
    id: 'street',
    label: 'Street',
    assets: {
      photo: '/images/exposure-simulator/street.jpg',
      depthMap: '/images/exposure-simulator/street-depth.png',
      motionMask: '/images/exposure-simulator/street-motion.png',
    },
  },
  {
    id: 'landscape',
    label: 'Landscape',
    assets: {
      photo: '/images/exposure-simulator/landscape.jpg',
      depthMap: '/images/exposure-simulator/landscape-depth.png',
      motionMask: '/images/exposure-simulator/landscape-motion.png',
    },
  },
  {
    id: 'portrait',
    label: 'Portrait',
    assets: {
      photo: '/images/exposure-simulator/portrait.jpg',
      depthMap: '/images/exposure-simulator/portrait-depth.png',
      motionMask: '/images/exposure-simulator/portrait-motion.png',
    },
  },
  {
    id: 'lowlight',
    label: 'Low Light',
    assets: {
      photo: '/images/exposure-simulator/lowlight.jpg',
      depthMap: '/images/exposure-simulator/lowlight-depth.png',
      motionMask: '/images/exposure-simulator/lowlight-motion.png',
    },
  },
]

interface ExposurePreviewProps {
  aperture: number
  shutterSpeed: number
  iso: number
}

export function ExposurePreview({ aperture, shutterSpeed, iso }: ExposurePreviewProps) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentScene = SCENES[sceneIdx]
  const { isLoading, error } = useExposureRenderer(
    canvasRef,
    currentScene.assets,
    aperture,
    shutterSpeed,
    iso
  )

  return (
    <div className={styles.canvasArea}>
      <div className={styles.topbar}>
        <div className={styles.sceneStrip}>
          <span className={styles.sceneStripLabel}>Scene:</span>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              className={`${styles.sceneThumb} ${idx === sceneIdx ? styles.sceneThumbActive : ''}`}
              onClick={() => setSceneIdx(idx)}
              aria-label={`Select ${scene.label} scene`}
              title={scene.label}
            >
              <img
                src={scene.assets.photo}
                alt={scene.label}
                width={48}
                height={32}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.canvasMain}>
        {error ? (
          <div className={styles.fallback}>
            <img
              src={currentScene.assets.photo}
              alt={currentScene.label}
              className={styles.fallbackImg}
            />
            <p>{error}. Image effects preview is unavailable.</p>
          </div>
        ) : isLoading ? (
          <div className={styles.loading}>Loading scene...</div>
        ) : null}
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ display: error || isLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/tools/exposure-simulator/ExposurePreview.tsx components/tools/exposure-simulator/ExposurePreview.module.css
git commit -m "feat(exposure): add ExposurePreview component with scene selector and WebGL canvas"
```

---

### Task 6: Refactor ExposureSimulator Layout

**Files:**
- Modify: `components/tools/exposure-simulator/ExposureSimulator.tsx`
- Modify: `components/tools/exposure-simulator/ExposureSimulator.module.css`

Refactor from the 2-column grid layout to the FOV-Viewer-style sidebar + canvas layout. All existing state management and exposure math stays unchanged.

- [ ] **Step 1: Rewrite `ExposureSimulator.module.css` for sidebar layout**

Replace the entire contents of `components/tools/exposure-simulator/ExposureSimulator.module.css` with:

```css
/* FOV-Viewer-style layout for Exposure Simulator */
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.appBody {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Lock row */
.lockRow {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lockLabel {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-right: 4px;
}

.lockBtn {
  padding: 4px 8px;
  min-height: 44px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}

.lockBtn:hover {
  border-color: var(--accent);
}

.lockBtnActive {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* Slider fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fieldLabel {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.fieldValue {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.lockIcon {
  font-size: 11px;
}

.slider {
  width: 100%;
  accent-color: var(--accent);
  height: 6px;
  cursor: pointer;
}

/* EV result card */
.resultCard {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.resultLabel {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.resultValue {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
}

/* Effects panel */
.effects {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--bg-surface);
  border-radius: 10px;
  padding: 14px;
}

.effectRow {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  align-items: center;
  gap: 8px;
}

.effectLabel {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.effectBarBg {
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.effectBar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.effectText {
  font-size: 12px;
  font-family: var(--font-mono);
  text-align: right;
  white-space: nowrap;
}

/* Mobile layout */
.mobileControls {
  display: none;
}

@media (max-width: 1023px) {
  .app {
    height: auto;
    overflow: visible;
  }

  .appBody {
    flex-direction: column;
    overflow: visible;
  }

  .sidebar {
    display: none;
  }

  .mobileControls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .slider {
    height: 44px;
  }
}
```

- [ ] **Step 2: Refactor `ExposureSimulator.tsx` to use sidebar + canvas layout**

Replace the entire contents of `components/tools/exposure-simulator/ExposureSimulator.tsx` with:

```typescript
'use client'

import { useState, useMemo, useCallback } from 'react'
import { calcEV } from '@/lib/math/exposure'
import { ExposurePreview } from './ExposurePreview'
import sim from './ExposureSimulator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
const SHUTTER_SPEEDS = [30, 15, 8, 4, 2, 1, 1/2, 1/4, 1/8, 1/15, 1/30, 1/60, 1/125, 1/250, 1/500, 1/1000, 1/2000, 1/4000, 1/8000]
const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600]

type LockTarget = 'aperture' | 'shutter' | 'iso'

function formatShutter(s: number): string {
  if (s >= 1) return `${s}s`
  return `1/${Math.round(1 / s)}`
}

function findNearest(arr: number[], target: number): number {
  let best = arr[0]
  let bestDist = Math.abs(Math.log2(target) - Math.log2(best))
  for (const v of arr) {
    const dist = Math.abs(Math.log2(target) - Math.log2(v))
    if (dist < bestDist) {
      bestDist = dist
      best = v
    }
  }
  return best
}

function dofLabel(aperture: number): string {
  if (aperture <= 2) return 'Very Shallow'
  if (aperture <= 4) return 'Shallow'
  if (aperture <= 8) return 'Moderate'
  if (aperture <= 16) return 'Deep'
  return 'Very Deep'
}

function motionLabel(shutter: number): string {
  if (shutter <= 1/1000) return 'Frozen'
  if (shutter <= 1/250) return 'Sharp'
  if (shutter <= 1/60) return 'Moderate'
  if (shutter <= 1/8) return 'Slight Blur'
  return 'Blurred'
}

function noiseLabel(iso: number): string {
  if (iso <= 200) return 'Clean'
  if (iso <= 800) return 'Low Noise'
  if (iso <= 3200) return 'Moderate Noise'
  if (iso <= 12800) return 'Noisy'
  return 'Very Noisy'
}

function effectBar(level: number): string {
  return `${Math.round(level * 100)}%`
}

function dofLevel(aperture: number): number {
  const idx = APERTURES.indexOf(aperture)
  return idx >= 0 ? idx / (APERTURES.length - 1) : 0.5
}

function motionLevel(shutter: number): number {
  const idx = SHUTTER_SPEEDS.indexOf(shutter)
  return idx >= 0 ? idx / (SHUTTER_SPEEDS.length - 1) : 0.5
}

function noiseLevel(iso: number): number {
  const idx = ISOS.indexOf(iso)
  return idx >= 0 ? idx / (ISOS.length - 1) : 0.5
}

function ControlsPanel({ aperture, apertureIdx, shutter, shutterIdx, iso, isoIdx, lock, totalEV, onLockChange, onApertureChange, onShutterChange, onIsoChange }: {
  aperture: number
  apertureIdx: number
  shutter: number
  shutterIdx: number
  iso: number
  isoIdx: number
  lock: LockTarget
  totalEV: number
  onLockChange: (t: LockTarget) => void
  onApertureChange: (idx: number) => void
  onShutterChange: (idx: number) => void
  onIsoChange: (idx: number) => void
}) {
  return (
    <>
      <div className={sim.lockRow}>
        <span className={sim.lockLabel}>Lock:</span>
        {(['aperture', 'shutter', 'iso'] as LockTarget[]).map((t) => (
          <button
            key={t}
            className={`${sim.lockBtn} ${lock === t ? sim.lockBtnActive : ''}`}
            onClick={() => onLockChange(t)}
            aria-pressed={lock === t}
            aria-label={`Lock ${t === 'aperture' ? 'Aperture' : t === 'shutter' ? 'Shutter' : 'ISO'}`}
          >
            {t === 'aperture' ? 'Aperture' : t === 'shutter' ? 'Shutter' : 'ISO'}
          </button>
        ))}
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          Aperture: <span className={sim.fieldValue}>f/{aperture}</span>
          {lock === 'aperture' && <span className={sim.lockIcon}> (locked)</span>}
        </label>
        <input
          type="range"
          className={sim.slider}
          min={0}
          max={APERTURES.length - 1}
          step={1}
          value={apertureIdx}
          onChange={(e) => onApertureChange(Number(e.target.value))}
          disabled={lock === 'aperture'}
        />
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          Shutter Speed: <span className={sim.fieldValue}>{formatShutter(shutter)}</span>
          {lock === 'shutter' && <span className={sim.lockIcon}> (locked)</span>}
        </label>
        <input
          type="range"
          className={sim.slider}
          min={0}
          max={SHUTTER_SPEEDS.length - 1}
          step={1}
          value={shutterIdx}
          onChange={(e) => onShutterChange(Number(e.target.value))}
          disabled={lock === 'shutter'}
        />
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          ISO: <span className={sim.fieldValue}>{iso}</span>
          {lock === 'iso' && <span className={sim.lockIcon}> (locked)</span>}
        </label>
        <input
          type="range"
          className={sim.slider}
          min={0}
          max={ISOS.length - 1}
          step={1}
          value={isoIdx}
          onChange={(e) => onIsoChange(Number(e.target.value))}
          disabled={lock === 'iso'}
        />
      </div>

      <div className={sim.resultCard}>
        <span className={sim.resultLabel}>Exposure Value (EV)</span>
        <span className={sim.resultValue}>{totalEV.toFixed(1)}</span>
      </div>

      <div className={sim.effects}>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>Depth of Field</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(dofLevel(aperture)), backgroundColor: 'var(--accent)' }} />
          </div>
          <span className={sim.effectText}>{dofLabel(aperture)}</span>
        </div>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>Motion</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(motionLevel(shutter)), backgroundColor: '#f59e0b' }} />
          </div>
          <span className={sim.effectText}>{motionLabel(shutter)}</span>
        </div>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>Noise</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(noiseLevel(iso)), backgroundColor: '#ef4444' }} />
          </div>
          <span className={sim.effectText}>{noiseLabel(iso)}</span>
        </div>
      </div>
    </>
  )
}

export function ExposureSimulator() {
  const [apertureIdx, setApertureIdx] = useState(APERTURES.indexOf(5.6))
  const [shutterIdx, setShutterIdx] = useState(SHUTTER_SPEEDS.indexOf(1/125))
  const [isoIdx, setIsoIdx] = useState(0)
  const [lock, setLock] = useState<LockTarget>('iso')

  const aperture = APERTURES[apertureIdx]
  const shutter = SHUTTER_SPEEDS[shutterIdx]
  const iso = ISOS[isoIdx]

  const ev100 = useMemo(() => calcEV(aperture, shutter), [aperture, shutter])
  const totalEV = ev100 + Math.log2(iso / 100)

  const handleApertureChange = useCallback((newIdx: number) => {
    const newAperture = APERTURES[newIdx]
    if (lock === 'aperture') return
    setApertureIdx(newIdx)

    if (lock === 'shutter') {
      const ev100New = calcEV(newAperture, shutter)
      const neededIsoLog = totalEV - ev100New
      const neededIso = 100 * Math.pow(2, neededIsoLog)
      const nearestIso = findNearest(ISOS, neededIso)
      setIsoIdx(ISOS.indexOf(nearestIso))
    } else if (lock === 'iso') {
      const targetEV100 = totalEV - Math.log2(iso / 100)
      const neededShutter = (newAperture * newAperture) / Math.pow(2, targetEV100)
      const nearestShutter = findNearest(SHUTTER_SPEEDS, neededShutter)
      setShutterIdx(SHUTTER_SPEEDS.indexOf(nearestShutter))
    }
  }, [lock, shutter, iso, totalEV])

  const handleShutterChange = useCallback((newIdx: number) => {
    const newShutter = SHUTTER_SPEEDS[newIdx]
    if (lock === 'shutter') return
    setShutterIdx(newIdx)

    if (lock === 'aperture') {
      const ev100New = calcEV(aperture, newShutter)
      const neededIsoLog = totalEV - ev100New
      const neededIso = 100 * Math.pow(2, neededIsoLog)
      const nearestIso = findNearest(ISOS, neededIso)
      setIsoIdx(ISOS.indexOf(nearestIso))
    } else if (lock === 'iso') {
      const targetEV100 = totalEV - Math.log2(iso / 100)
      const neededAperture = Math.sqrt(newShutter * Math.pow(2, targetEV100))
      const nearestAperture = findNearest(APERTURES, neededAperture)
      setApertureIdx(APERTURES.indexOf(nearestAperture))
    }
  }, [lock, aperture, iso, totalEV])

  const handleIsoChange = useCallback((newIdx: number) => {
    const newIso = ISOS[newIdx]
    if (lock === 'iso') return
    setIsoIdx(newIdx)

    if (lock === 'aperture') {
      const targetEV100 = totalEV - Math.log2(newIso / 100)
      const neededShutter = (aperture * aperture) / Math.pow(2, targetEV100)
      const nearestShutter = findNearest(SHUTTER_SPEEDS, neededShutter)
      setShutterIdx(SHUTTER_SPEEDS.indexOf(nearestShutter))
    } else if (lock === 'shutter') {
      const targetEV100 = totalEV - Math.log2(newIso / 100)
      const neededAperture = Math.sqrt(shutter * Math.pow(2, targetEV100))
      const nearestAperture = findNearest(APERTURES, neededAperture)
      setApertureIdx(APERTURES.indexOf(nearestAperture))
    }
  }, [lock, aperture, shutter, totalEV])

  const controlsProps = {
    aperture, apertureIdx, shutter, shutterIdx, iso, isoIdx, lock, totalEV,
    onLockChange: setLock,
    onApertureChange: handleApertureChange,
    onShutterChange: handleShutterChange,
    onIsoChange: handleIsoChange,
  }

  return (
    <div className={sim.app}>
      <div className={sim.appBody}>
        <div className={sim.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <ExposurePreview
          aperture={aperture}
          shutterSpeed={shutter}
          iso={iso}
        />
      </div>

      {/* Mobile: controls below canvas */}
      <div className={sim.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add components/tools/exposure-simulator/ExposureSimulator.tsx components/tools/exposure-simulator/ExposureSimulator.module.css
git commit -m "feat(exposure): refactor layout to FOV-Viewer-style sidebar + canvas"
```

---

### Task 7: Update ToolPageShell Integration

**Files:**
- Modify: `app/tools/exposure-simulator/page.tsx`

The `ToolPageShell` wrapper may constrain the height. Check and update if needed so the new full-height layout works correctly.

- [ ] **Step 1: Read the current page file and ToolPageShell component**

Read `app/tools/exposure-simulator/page.tsx` and `components/shared/ToolPageShell.tsx` to understand how the shell wraps the simulator.

- [ ] **Step 2: Update the page if the shell constrains height**

The ExposureSimulator now needs full viewport height (like FOV Viewer). Check how the FOV Viewer page (`app/tools/fov-viewer/page.tsx`) handles this and match its approach. If the FOV Viewer bypasses `ToolPageShell` or uses a special prop, do the same for the exposure simulator.

- [ ] **Step 3: Verify with `npm run dev`**

Run: `npm run dev`
Open `http://localhost:3000/tools/exposure-simulator` and verify:
- Sidebar with controls on left (280px)
- Scene strip with 4 thumbnails at top
- WebGL canvas in the center showing the scene with effects
- Sliders adjust the image in real-time
- Scene thumbnails switch images

- [ ] **Step 4: Commit (if changes were needed)**

```bash
git add app/tools/exposure-simulator/page.tsx
git commit -m "fix(exposure): update page wrapper for full-height layout"
```

---

### Task 8: Run Full Test Suite and Fix Issues

**Files:**
- Possibly modify: any files with test failures

- [ ] **Step 1: Run the full test suite**

Run: `npm test -- --run`
Expected: All tests pass

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Fix any issues found and commit**

If there are any test failures, lint errors, or build errors, fix them and commit:

```bash
git add -A
git commit -m "fix(exposure): resolve test/lint/build issues from image preview feature"
```
