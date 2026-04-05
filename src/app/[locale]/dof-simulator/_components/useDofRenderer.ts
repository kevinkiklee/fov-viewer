'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { passthroughVertexShader } from './shaders/passthrough.vert'
import { dofBlurFragmentShader } from './shaders/dofBlur.frag'
import {
  type GLResources,
  createProgram,
  createFramebuffer,
  loadImageAsTexture,
  setupFullScreenQuad,
  cleanupResources,
} from './webglHelpers'
import { renderDofPasses } from './renderPipeline'

interface DofSceneInput {
  photo: string
  depthMap: string
  nearDistance: number
  farDistance: number
}

export function useDofRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  scene: DofSceneInput | null,
  focalLength: number,
  aperture: number,
  subjectDistance: number,
  sensorWidth: number,
  useDiffraction: boolean,
): { isLoading: boolean; error: string | null } {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const resourcesRef = useRef<GLResources | null>(null)
  const scenePhotoRef = useRef<string | null>(null)

  const initGL = useCallback((canvas: HTMLCanvasElement): GLResources | null => {
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) {
      setError('WebGL2 is not supported by your browser.')
      return null
    }

    const program = createProgram(gl, passthroughVertexShader, dofBlurFragmentShader)
    const vao = setupFullScreenQuad(gl, program)

    return {
      gl, program, vao,
      framebufferA: null, framebufferB: null,
      textureA: null, textureB: null,
      photoTexture: null, depthTexture: null,
      width: 0, height: 0,
    }
  }, [])

  // Load scene textures when scene changes
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

      // Skip re-load if same scene photo
      if (scenePhotoRef.current === scene.photo) {
        setIsLoading(false)
        return
      }

      const { gl } = resources

      try {
        const [photoResult, depthResult] = await Promise.all([
          loadImageAsTexture(gl, scene.photo),
          loadImageAsTexture(gl, scene.depthMap),
        ])

        if (cancelled) return

        // Clean up old textures
        if (resources.photoTexture) gl.deleteTexture(resources.photoTexture)
        if (resources.depthTexture) gl.deleteTexture(resources.depthTexture)

        resources.photoTexture = photoResult.texture
        resources.depthTexture = depthResult.texture

        // Set canvas size to match photo
        const canvas = canvasRef.current!
        canvas.width = photoResult.width
        canvas.height = photoResult.height
        resources.width = photoResult.width
        resources.height = photoResult.height

        // Recreate framebuffers for new dimensions
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

        scenePhotoRef.current = scene.photo
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

  // Render when camera parameters change
  useEffect(() => {
    const resources = resourcesRef.current
    if (!resources || !resources.photoTexture || !resources.framebufferA || isLoading) return
    if (!scene) return

    renderDofPasses(
      resources, focalLength, aperture, subjectDistance,
      sensorWidth, scene.nearDistance, scene.farDistance, useDiffraction,
    )
  }, [focalLength, aperture, subjectDistance, sensorWidth, useDiffraction, isLoading, scene])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resourcesRef.current) {
        cleanupResources(resourcesRef.current)
        resourcesRef.current = null
      }
    }
  }, [])

  return { isLoading, error }
}
