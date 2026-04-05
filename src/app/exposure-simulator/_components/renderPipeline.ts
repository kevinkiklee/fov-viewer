import { calcMotionBlurAmount, calcNoiseAmplitude } from '@/lib/math/exposure'
import type { GLResources } from './webglHelpers'

export function runRenderPipeline(
  resources: GLResources,
  aperture: number,
  shutterSpeed: number,
  iso: number,
) {
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

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferB)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, textureA)

  gl.uniform2f(gl.getUniformLocation(dofProgram, 'u_direction'), 0.0, 1.0)

  gl.drawArrays(gl.TRIANGLES, 0, 6)

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

  gl.useProgram(noiseProgram)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, textureA)
  gl.uniform1i(gl.getUniformLocation(noiseProgram, 'u_image'), 0)

  gl.uniform1f(gl.getUniformLocation(noiseProgram, 'u_noiseAmplitude'), noiseAmp)
  gl.uniform1f(gl.getUniformLocation(noiseProgram, 'u_seed'), Math.random() * 1000)

  gl.drawArrays(gl.TRIANGLES, 0, 6)

  gl.bindVertexArray(null)
}

export function cleanupResources(resources: GLResources) {
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
}
