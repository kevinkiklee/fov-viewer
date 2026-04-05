'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { passthroughVertexShader } from './shaders/passthrough.vert'
import { wbFragmentShader } from './shaders/wb.frag'
import type { GLResources } from './webgl-helpers'
import { createProgram, loadImageAsTexture, setupFullScreenQuad } from './webgl-helpers'

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
    return { gl, program, vao, photoTexture: null, width: 0, height: 0 }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !sceneSrc) return
    let cancelled = false

    const canvas = canvasRef.current
    const load = async () => {
      setIsLoading(true)
      setError(null)

      let resources = resourcesRef.current
      if (!resources) {
        resources = initGL(canvas)
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
