'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { passthroughVertexShader } from './shaders/passthrough.vert'
import { wbFragmentShader } from './shaders/wb.frag'

interface GLResources {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  vao: WebGLVertexArrayObject
  photoTexture: WebGLTexture
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

function setupFullScreenQuad(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
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
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const texBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuf)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(1)
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)

  gl.bindVertexArray(null)
  return vao
}

export function useWbRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  sceneSrc: string | null,
  rgb: { r: number; g: number; b: number }
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
    const program = createProgram(gl, passthroughVertexShader, wbFragmentShader)
    const vao = setupFullScreenQuad(gl)
    return { gl, program, vao, photoTexture: null!, width: 0, height: 0 }
  }, [])

  // Load scene texture
  useEffect(() => {
    if (!canvasRef.current || !sceneSrc) return
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

      if (sceneRef.current === sceneSrc) {
        setIsLoading(false)
        return
      }

      const { gl } = resources
      try {
        const result = await loadImageAsTexture(gl, sceneSrc)
        if (cancelled) return

        if (resources.photoTexture) gl.deleteTexture(resources.photoTexture)
        resources.photoTexture = result.texture

        const canvas = canvasRef.current!
        canvas.width = result.width
        canvas.height = result.height
        resources.width = result.width
        resources.height = result.height

        sceneRef.current = sceneSrc
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
  }, [canvasRef, sceneSrc, initGL])

  // Render — single pass, apply white balance multiplier
  useEffect(() => {
    const resources = resourcesRef.current
    if (!resources || !resources.photoTexture || isLoading) return

    const { gl, program, vao, photoTexture, width, height } = resources

    gl.viewport(0, 0, width, height)
    gl.bindVertexArray(vao)
    gl.useProgram(program)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, photoTexture)
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0)

    // Normalize RGB so the max channel is 1.0 (preserves brightness)
    const maxCh = Math.max(rgb.r, rgb.g, rgb.b, 1)
    gl.uniform3f(
      gl.getUniformLocation(program, 'u_wbMultiplier'),
      rgb.r / maxCh,
      rgb.g / maxCh,
      rgb.b / maxCh
    )

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.bindVertexArray(null)
  }, [rgb.r, rgb.g, rgb.b, isLoading])

  // Cleanup
  useEffect(() => {
    return () => {
      const resources = resourcesRef.current
      if (!resources) return
      const { gl } = resources
      gl.deleteProgram(resources.program)
      gl.deleteVertexArray(resources.vao)
      if (resources.photoTexture) gl.deleteTexture(resources.photoTexture)
      resourcesRef.current = null
    }
  }, [])

  return { isLoading, error }
}
