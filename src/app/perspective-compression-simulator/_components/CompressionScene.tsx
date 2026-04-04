'use client'

import { useEffect, useRef, useCallback } from 'react'
import { calcCameraDistance } from '@/lib/math/compression'
import { calcFOV } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { compressionVertexShader } from './shaders/compression.vert'
import { compressionFragmentShader } from './shaders/compression.frag'
import styles from './CompressionScene.module.css'

/* ─── Constants ─── */
const PILLAR_COUNT = 5
const PILLAR_SPACING = 5 // ft between pillars
const PILLAR_RADIUS = 0.3
const PILLAR_HEIGHT = 4.0
const PILLAR_SEGMENTS = 16
const REF_FOCAL = 50
const SUBJECT_DIST = 10 // distance to nearest pillar at ref focal

const ACCENT_COLOR = '#3b82f6'

const PILLAR_COLORS: [number, number, number][] = [
  [0.93, 0.26, 0.26], // red
  [0.95, 0.61, 0.15], // orange
  [0.95, 0.85, 0.20], // yellow
  [0.25, 0.78, 0.35], // green
  [0.30, 0.50, 0.90], // blue
]

const GROUND_COLOR: [number, number, number] = [0.15, 0.15, 0.20]

/* ─── Props ─── */
export interface CompressionSceneProps {
  focalLength: number
  sensorId: string
  distance: number
}

/* ─── Matrix utilities (no deps) ─── */

function mat4Perspective(fovYRad: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovYRad / 2)
  const nf = 1 / (near - far)
  const out = new Float32Array(16)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
  return out
}

function mat4LookAt(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): Float32Array {
  const zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2]
  let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz)
  const fz0 = zx * len, fz1 = zy * len, fz2 = zz * len

  // cross(up, forward)
  const sx = up[1] * fz2 - up[2] * fz1
  const sy = up[2] * fz0 - up[0] * fz2
  const sz = up[0] * fz1 - up[1] * fz0
  len = Math.sqrt(sx * sx + sy * sy + sz * sz)
  const fx0 = len > 0 ? sx / len : 0
  const fx1 = len > 0 ? sy / len : 0
  const fx2 = len > 0 ? sz / len : 0

  // cross(forward, side)
  const ux = fz1 * fx2 - fz2 * fx1
  const uy = fz2 * fx0 - fz0 * fx2
  const uz = fz0 * fx1 - fz1 * fx0

  const out = new Float32Array(16)
  out[0] = fx0; out[1] = ux; out[2] = fz0; out[3] = 0
  out[4] = fx1; out[5] = uy; out[6] = fz1; out[7] = 0
  out[8] = fx2; out[9] = uz; out[10] = fz2; out[11] = 0
  out[12] = -(fx0 * eye[0] + fx1 * eye[1] + fx2 * eye[2])
  out[13] = -(ux * eye[0] + uy * eye[1] + uz * eye[2])
  out[14] = -(fz0 * eye[0] + fz1 * eye[1] + fz2 * eye[2])
  out[15] = 1
  return out
}

/* ─── Geometry builders ─── */

interface GeoArrays {
  positions: number[]
  normals: number[]
  colors: number[]
}

function buildCylinder(
  cx: number,
  cz: number,
  radius: number,
  height: number,
  segments: number,
  color: [number, number, number],
): GeoArrays {
  const positions: number[] = []
  const normals: number[] = []
  const colors: number[] = []

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2
    const a1 = ((i + 1) / segments) * Math.PI * 2

    const cos0 = Math.cos(a0), sin0 = Math.sin(a0)
    const cos1 = Math.cos(a1), sin1 = Math.sin(a1)

    const x0 = cx + radius * cos0, z0 = cz + radius * sin0
    const x1 = cx + radius * cos1, z1 = cz + radius * sin1

    // Side quad (two triangles)
    positions.push(x0, 0, z0,  x1, 0, z1,  x0, height, z0)
    positions.push(x0, height, z0,  x1, 0, z1,  x1, height, z1)

    const nx0 = cos0, nz0 = sin0
    const nx1 = cos1, nz1 = sin1
    for (let t = 0; t < 6; t++) {
      const nx = t < 3 || t === 3 ? nx0 : nx1
      const nz = t < 3 || t === 3 ? nz0 : nz1
      normals.push(nx, 0, nz)
      colors.push(color[0], color[1], color[2])
    }

    // Top cap triangle
    positions.push(cx, height, cz,  x0, height, z0,  x1, height, z1)
    for (let t = 0; t < 3; t++) {
      normals.push(0, 1, 0)
      colors.push(color[0] * 0.8, color[1] * 0.8, color[2] * 0.8)
    }
  }

  return { positions, normals, colors }
}

function buildGroundPlane(): GeoArrays {
  const s = 40
  const positions = [
    -s, 0, -s,   s, 0, -s,  -s, 0, s,
    -s, 0,  s,   s, 0, -s,   s, 0, s,
  ]
  const normals = [
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, 1, 0,  0, 1, 0,  0, 1, 0,
  ]
  const colors: number[] = []
  for (let i = 0; i < 6; i++) {
    colors.push(GROUND_COLOR[0], GROUND_COLOR[1], GROUND_COLOR[2])
  }
  return { positions, normals, colors }
}

function mergeGeo(...parts: GeoArrays[]): GeoArrays {
  const positions: number[] = []
  const normals: number[] = []
  const colors: number[] = []
  for (const p of parts) {
    positions.push(...p.positions)
    normals.push(...p.normals)
    colors.push(...p.colors)
  }
  return { positions, normals, colors }
}

/* ─── WebGL helpers ─── */

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
  gl.bindAttribLocation(program, 0, 'a_position')
  gl.bindAttribLocation(program, 1, 'a_normal')
  gl.bindAttribLocation(program, 2, 'a_color')
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

/* ─── Component ─── */

export function CompressionScene({ focalLength, sensorId, distance }: CompressionSceneProps) {
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null)
  const diagramCanvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null)
  const vertCountRef = useRef(0)

  // Build geometry and upload to GPU once
  useEffect(() => {
    const canvas = sceneCanvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return
    glRef.current = gl

    let program: WebGLProgram
    try {
      program = createProgram(gl, compressionVertexShader, compressionFragmentShader)
    } catch (e) {
      console.error(e)
      return
    }
    programRef.current = program

    // Build scene geometry
    const parts: GeoArrays[] = [buildGroundPlane()]
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const pz = -(SUBJECT_DIST + i * PILLAR_SPACING)
      parts.push(buildCylinder(0, pz, PILLAR_RADIUS, PILLAR_HEIGHT, PILLAR_SEGMENTS, PILLAR_COLORS[i]))
    }
    const geo = mergeGeo(...parts)
    vertCountRef.current = geo.positions.length / 3

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    vaoRef.current = vao

    const posBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geo.positions), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)

    const normBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geo.normals), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)

    const colBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geo.colors), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(2)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)

    gl.bindVertexArray(null)

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.08, 0.08, 0.15, 1.0)

    return () => {
      if (programRef.current) {
        gl.deleteProgram(programRef.current)
        programRef.current = null
      }
      if (vaoRef.current) {
        gl.deleteVertexArray(vaoRef.current)
        vaoRef.current = null
      }
      glRef.current = null
    }
  }, [])

  // Render function for the 3D scene
  const render3D = useCallback(() => {
    const gl = glRef.current
    const program = programRef.current
    const vao = vaoRef.current
    const canvas = sceneCanvasRef.current
    if (!gl || !program || !vao || !canvas) return

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindVertexArray(vao)

    const sensor = getSensor(sensorId)
    const cameraDist = calcCameraDistance(focalLength, REF_FOCAL, distance)
    const fov = calcFOV(focalLength, sensor.cropFactor)
    const vFovRad = (fov.vertical * Math.PI) / 180

    const aspect = canvas.width / canvas.height
    const cameraZ = cameraDist - SUBJECT_DIST
    const eye: [number, number, number] = [0, PILLAR_HEIGHT * 0.5, cameraZ]
    const target: [number, number, number] = [0, PILLAR_HEIGHT * 0.5, cameraZ - 1]

    const projection = mat4Perspective(vFovRad, aspect, 0.1, 200.0)
    const view = mat4LookAt(eye, target, [0, 1, 0])

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_projection'), false, projection)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_view'), false, view)
    gl.uniform3f(gl.getUniformLocation(program, 'u_lightDir'), 0.3, 1.0, 0.5)
    gl.uniform3f(gl.getUniformLocation(program, 'u_cameraPos'), eye[0], eye[1], eye[2])

    gl.drawArrays(gl.TRIANGLES, 0, vertCountRef.current)
    gl.bindVertexArray(null)
  }, [focalLength, sensorId, distance])

  // Render top-down diagram
  const renderDiagram = useCallback(() => {
    const canvas = diagramCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const dpr = window.devicePixelRatio || 1

    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = 'rgba(20, 20, 30, 1)'
    ctx.fillRect(0, 0, w, h)

    const sensor = getSensor(sensorId)
    const cameraDist = calcCameraDistance(focalLength, REF_FOCAL, distance)
    const fov = calcFOV(focalLength, sensor.cropFactor)
    const hFovRad = (fov.horizontal * Math.PI) / 180

    // Coordinate mapping: camera on left, pillars to right
    const farthestPillarZ = SUBJECT_DIST + (PILLAR_COUNT - 1) * PILLAR_SPACING
    const maxRange = cameraDist + farthestPillarZ + 5
    const margin = 30 * dpr
    const usableW = w - margin * 2
    const usableH = h - 10 * dpr

    const mapX = (dist: number) => margin + ((cameraDist - dist) / maxRange) * usableW
    const mapY = (offset: number) => h / 2 + offset * (usableH / 2)

    const cameraX = mapX(0)
    const centerY = h / 2

    // Draw FOV cone
    const coneLen = farthestPillarZ + 10
    const halfSpread = Math.tan(hFovRad / 2) * coneLen
    const coneEndX = mapX(-coneLen)
    const topY = mapY(-halfSpread / maxRange * 2)
    const botY = mapY(halfSpread / maxRange * 2)

    ctx.save()
    ctx.globalAlpha = 0.12
    ctx.fillStyle = ACCENT_COLOR
    ctx.beginPath()
    ctx.moveTo(cameraX, centerY)
    ctx.lineTo(coneEndX, topY)
    ctx.lineTo(coneEndX, botY)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = ACCENT_COLOR
    ctx.lineWidth = 1 * dpr
    ctx.beginPath()
    ctx.moveTo(cameraX, centerY)
    ctx.lineTo(coneEndX, topY)
    ctx.moveTo(cameraX, centerY)
    ctx.lineTo(coneEndX, botY)
    ctx.stroke()
    ctx.restore()

    // Draw pillars as circles
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const pillarDist = SUBJECT_DIST + i * PILLAR_SPACING
      const px = mapX(-pillarDist)
      const [r, g, b] = PILLAR_COLORS[i]
      ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
      ctx.beginPath()
      ctx.arc(px, centerY, 4 * dpr, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw camera as triangle
    ctx.fillStyle = ACCENT_COLOR
    ctx.beginPath()
    const triSize = 6 * dpr
    ctx.moveTo(cameraX + triSize, centerY)
    ctx.lineTo(cameraX - triSize * 0.6, centerY - triSize * 0.7)
    ctx.lineTo(cameraX - triSize * 0.6, centerY + triSize * 0.7)
    ctx.closePath()
    ctx.fill()

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = `${10 * dpr}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(`${focalLength}mm`, cameraX, centerY - 10 * dpr)

    const nearPillarX = mapX(-SUBJECT_DIST)
    ctx.fillText(`${Math.round(cameraDist)}ft`, (cameraX + nearPillarX) / 2, centerY + 14 * dpr)
  }, [focalLength, sensorId, distance])

  // Resize observer for 3D canvas
  useEffect(() => {
    const canvas = sceneCanvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      render3D()
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [render3D])

  // Resize observer for diagram canvas
  useEffect(() => {
    const canvas = diagramCanvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      renderDiagram()
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [renderDiagram])

  // Re-render on prop changes
  useEffect(() => {
    render3D()
    renderDiagram()
  }, [render3D, renderDiagram])

  return (
    <div className={styles.container}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <canvas
          ref={sceneCanvasRef}
          className={styles.sceneCanvas}
          aria-label="Perspective compression 3D scene"
          role="img"
        />
      </div>
      <div className={styles.diagram}>
        <canvas
          ref={diagramCanvasRef}
          className={styles.diagramCanvas}
          aria-label="Top-down compression diagram"
          role="img"
        />
      </div>
    </div>
  )
}
