'use client'

import { useCallback, useState, type RefObject } from 'react'
import { copyCanvasToClipboard } from '@/lib/utils/export'
import { Toast } from './Toast'

interface CopyImageButtonProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  filename?: string
  className?: string
  label?: string
}

export function CopyImageButton({ canvasRef, filename = 'image.png', className, label = 'Copy image' }: CopyImageButtonProps) {
  const [toast, setToast] = useState<string | null>(null)

  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return
    const ok = await copyCanvasToClipboard(canvasRef.current, filename)
    setToast(ok ? 'Copied image!' : 'Failed to copy')
  }, [canvasRef, filename])

  return (
    <>
      <button className={className} onClick={handleCopy}>
        {label}
      </button>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
