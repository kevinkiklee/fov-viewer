'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { passthroughVertexShader } from './shaders/passthrough.vert'
import { dofFragmentShader } from './shaders/dof.frag'
import { motionFragmentShader } from './shaders/motion.frag'
import { noiseFragmentShader } from './shaders/noise.frag'
import { calcMotionBlurAmount, calcNoiseAmplitude } from '@/lib/math/exposure'

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
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
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

        if (resources.photoTexture) gl.deleteTexture(resources.photoTexture)
        if (resources.depthTexture) gl.deleteTexture(resources.depthTexture)
        if (resources.motionTexture) gl.deleteTexture(resources.motionTexture)

        resources.photoTexture = photoResult.texture
        resources.depthTexture = depthResult.texture
        resources.motionTexture = motionResult.texture

        const canvas = canvasRef.current!
        canvas.width = photoResult.width
        canvas.height = photoResult.height
        resources.width = photoResult.width
        resources.height = photoResult.height

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

    // Pass 1: DOF horizontal blur (photo → framebuffer A)
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

    // Pass 2: DOF vertical blur (framebuffer A → framebuffer B)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferB)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureA)

    gl.uniform2f(gl.getUniformLocation(dofProgram, 'u_direction'), 0.0, 1.0)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Pass 3: Motion blur (framebuffer B → framebuffer A)
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

    // Pass 4: Noise (framebuffer A → screen)
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
