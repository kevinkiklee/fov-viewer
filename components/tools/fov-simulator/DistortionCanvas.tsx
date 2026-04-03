'use client'

import { useEffect, useRef } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import { calcDistortionK1 } from '@/lib/math/distortion'
import { getSensor } from '@/lib/data/sensors'
import { SCENES } from '@/lib/data/scenes'
import { distortionVertexShader } from './shaders/distortion.vert'
import { distortionFragmentShader } from './shaders/distortion.frag'
import styles from './FovSimulator.module.css'

export interface DistortionCanvasProps {
  lens: LensConfig
  imageIndex: number
  orientation: Orientation
  showGrid: boolean
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create shader')
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
  const program = gl.createProgram()
  if (!program) throw new Error('Failed to create program')
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${info}`)
  }
  return program
}

export function DistortionCanvas({ lens, imageIndex, orientation, showGrid, canvasRef }: DistortionCanvasProps) {
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null)
  const textureRef = useRef<WebGLTexture | null>(null)
  const imageLoadedRef = useRef(false)

  // Render the distortion effect
  const render = useRef<(() => void) | null>(null)

  // Set up WebGL resources once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let gl = glRef.current
    if (!gl) {
      const ctx = canvas.getContext('webgl2')
      if (!ctx) return
      gl = ctx
      glRef.current = gl
    }

    // Create and compile shader program
    let program: WebGLProgram
    try {
      program = createProgram(gl, distortionVertexShader, distortionFragmentShader)
    } catch (e) {
      console.error(e)
      return
    }
    programRef.current = program

    // Fullscreen quad: two triangles covering clip space [-1,-1] to [1,1]
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    vaoRef.current = vao

    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.bindVertexArray(null)

    // Create texture
    const texture = gl.createTexture()
    textureRef.current = texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    render.current = () => {
      const currentGl = glRef.current
      const currentProgram = programRef.current
      const currentVao = vaoRef.current
      if (!currentGl || !currentProgram || !currentVao || !imageLoadedRef.current) return

      currentGl.viewport(0, 0, canvas.width, canvas.height)
      currentGl.clearColor(0, 0, 0, 1)
      currentGl.clear(currentGl.COLOR_BUFFER_BIT)

      currentGl.useProgram(currentProgram)
      currentGl.bindVertexArray(currentVao)

      const sensor = getSensor(lens.sensorId)
      const effectiveFocalLength = lens.focalLength / sensor.cropFactor
      const k1 = calcDistortionK1(effectiveFocalLength)

      currentGl.uniform1f(currentGl.getUniformLocation(currentProgram, 'u_k1'), k1)
      currentGl.uniform1i(currentGl.getUniformLocation(currentProgram, 'u_showGrid'), showGrid ? 1 : 0)
      currentGl.uniform2f(currentGl.getUniformLocation(currentProgram, 'u_resolution'), canvas.width, canvas.height)

      currentGl.activeTexture(currentGl.TEXTURE0)
      currentGl.bindTexture(currentGl.TEXTURE_2D, textureRef.current)
      currentGl.uniform1i(currentGl.getUniformLocation(currentProgram, 'u_image'), 0)

      currentGl.drawArrays(currentGl.TRIANGLE_STRIP, 0, 4)
      currentGl.bindVertexArray(null)
    }

    return () => {
      // Cleanup WebGL resources
      const currentGl = glRef.current
      if (!currentGl) return
      if (programRef.current) {
        currentGl.deleteProgram(programRef.current)
        programRef.current = null
      }
      if (vaoRef.current) {
        currentGl.deleteVertexArray(vaoRef.current)
        vaoRef.current = null
      }
      if (textureRef.current) {
        currentGl.deleteTexture(textureRef.current)
        textureRef.current = null
      }
      glRef.current = null
      imageLoadedRef.current = false
      render.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // Load image when imageIndex changes
  useEffect(() => {
    const gl = glRef.current
    const texture = textureRef.current
    if (!gl || !texture) return

    imageLoadedRef.current = false
    const img = new Image()
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      imageLoadedRef.current = true
      render.current?.()
    }
    img.src = SCENES[imageIndex].src
  }, [imageIndex])

  // Re-render when lens, showGrid, or orientation changes
  useEffect(() => {
    render.current?.()
  }, [lens, showGrid, orientation])

  // ResizeObserver — same 3:2 / 2:3 pattern as Canvas.tsx
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      const aspect = orientation === 'landscape' ? 3 / 2 : 2 / 3

      let w = rect.width
      let h = w / aspect

      if (h > rect.height) {
        h = rect.height
        w = h * aspect
      }

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = w * dpr
      canvas.height = h * dpr

      render.current?.()
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [canvasRef, orientation])

  return (
    <canvas
      ref={canvasRef}
      className={styles.fovCanvas}
      aria-label="Lens distortion preview"
      role="img"
    />
  )
}
