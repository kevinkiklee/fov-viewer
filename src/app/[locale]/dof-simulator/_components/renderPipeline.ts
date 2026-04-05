import type { GLResources } from './webglHelpers'

const MAX_BLUR_RADIUS = 30

/** Execute the 2-pass separable Gaussian DOF blur. */
export function renderDofPasses(
  resources: GLResources,
  focalLength: number,
  aperture: number,
  subjectDistance: number,
  sensorWidth: number,
  nearDistance: number,
  farDistance: number,
  useDiffractionFlag: boolean,
): void {
  const { gl, program, vao,
    framebufferA, textureA,
    photoTexture, depthTexture, width, height } = resources

  gl.viewport(0, 0, width, height)
  gl.bindVertexArray(vao)
  gl.useProgram(program)

  const texelSize: [number, number] = [1.0 / width, 1.0 / height]

  // Bind depth map to texture unit 1 (stays bound for both passes)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, depthTexture)
  gl.uniform1i(gl.getUniformLocation(program, 'u_depthMap'), 1)

  // Set shared uniforms
  gl.uniform1f(gl.getUniformLocation(program, 'u_focalLength'), focalLength)
  gl.uniform1f(gl.getUniformLocation(program, 'u_aperture'), aperture)
  gl.uniform1f(gl.getUniformLocation(program, 'u_subjectDistance'), subjectDistance)
  gl.uniform1f(gl.getUniformLocation(program, 'u_sensorWidth'), sensorWidth)
  gl.uniform1f(gl.getUniformLocation(program, 'u_nearDistance'), nearDistance)
  gl.uniform1f(gl.getUniformLocation(program, 'u_farDistance'), farDistance)
  gl.uniform1f(gl.getUniformLocation(program, 'u_maxRadius'), MAX_BLUR_RADIUS)
  gl.uniform2f(gl.getUniformLocation(program, 'u_texelSize'), texelSize[0], texelSize[1])
  gl.uniform1i(gl.getUniformLocation(program, 'u_useDiffraction'), useDiffractionFlag ? 1 : 0)

  // Pass 1: Horizontal blur — photo → framebufferA
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferA)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, photoTexture)
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0)
  gl.uniform2f(gl.getUniformLocation(program, 'u_direction'), 1.0, 0.0)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  // Pass 2: Vertical blur — framebufferA → screen
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, textureA)
  gl.uniform2f(gl.getUniformLocation(program, 'u_direction'), 0.0, 1.0)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  gl.bindVertexArray(null)
}
