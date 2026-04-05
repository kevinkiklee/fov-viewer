'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ExifReader from 'exifreader'
import { FileDropZone } from '@/components/shared/FileDropZone'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { getToolBySlug } from '@/lib/data/tools'
import { computeHistogram, detectClipping } from '@/lib/math/histogram'
import type { HistogramData } from '@/lib/math/histogram'
import { parseExif, type ExifResult } from './exifHelpers'
import type { ViewMode } from './drawHistogram'
import { ExifPanel } from './ExifPanel'
import { HistogramCard } from './HistogramCard'
import styles from './HistogramExplainer.module.css'

interface ClipInfo {
  hasBlackClip: boolean
  hasWhiteClip: boolean
  blackClipPercent: number
  whiteClipPercent: number
}

const tool = getToolBySlug('exif-viewer')!

const HISTOGRAM_MODE_KEYS: { key: ViewMode; labelKey: string }[] = [
  { key: 'luminance', labelKey: 'luminance' },
  { key: 'rgb', labelKey: 'rgbOverlay' },
  { key: 'channels', labelKey: 'allChannels' },
]

function ControlsPanel({ hist, clip, onFile }: {
  hist: HistogramData | null
  clip: ClipInfo | null
  onFile: (file: File) => void
}) {
  const t = useTranslations('toolUI.histogram')
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.description}>{tool.description}</p>
      </div>

      <FileDropZone onFile={onFile} />

      {hist && (clip?.hasBlackClip || clip?.hasWhiteClip) && (
        <div className={styles.annotations}>
          {clip?.hasBlackClip && (
            <div className={styles.warning}>
              {t('blackClipping')} &mdash; {clip.blackClipPercent.toFixed(1)}% {t('pureBlack')}
            </div>
          )}
          {clip?.hasWhiteClip && (
            <div className={styles.warning}>
              {t('whiteClipping')} &mdash; {clip.whiteClipPercent.toFixed(1)}% {t('pureWhite')}
            </div>
          )}
        </div>
      )}
    </>
  )
}

const SAMPLE_IMAGE = '/images/samples/example.jpg'

export function HistogramExplainer() {
  const t = useTranslations('toolUI.histogram')
  const [hist, setHist] = useState<HistogramData | null>(null)
  const [clip, setClip] = useState<ClipInfo | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [exif, setExif] = useState<ExifResult | null>(null)
  const [exifError, setExifError] = useState<string | null>(null)
  const fileRef = useRef<File | null>(null)
  const loadedRef = useRef(false)

  const processFile = useCallback((file: File, previewUrl?: string) => {
    fileRef.current = file

    setExifError(null)
    setExif(null)
    const exifReader = new FileReader()
    exifReader.onload = () => {
      try {
        const buffer = exifReader.result as ArrayBuffer
        const tags = ExifReader.load(buffer)
        setExif(parseExif(tags))
      } catch {
        setExifError(t('noExifData'))
      }
    }
    exifReader.readAsArrayBuffer(file)

    const img = new Image()
    const url = previewUrl ?? URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const histogram = computeHistogram(imageData.data, canvas.width, canvas.height)
      const clipping = detectClipping(histogram)
      setHist(histogram)
      setClip(clipping)
      setImageUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return url
      })
    }
    img.src = url
  }, [t])

  const handleFile = useCallback((file: File) => {
    processFile(file)
  }, [processFile])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    fetch(SAMPLE_IMAGE)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'example.jpg', { type: 'image/jpeg' })
        processFile(file, SAMPLE_IMAGE)
      })
      .catch(() => { /* ignore — user can upload manually */ })
  }, [processFile])

  const controlsProps = { hist, clip, onFile: handleFile }
  const hasData = hist || exif

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        <div className={styles.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={styles.main}>
          {hasData ? (
            <>
              <div className={styles.topRow}>
                {imageUrl && (
                  <div className={styles.imagePreview}>
                    <img src={imageUrl} alt={t('uploadedPhoto')} className={styles.previewImg} />
                  </div>
                )}
                {exif && <ExifPanel data={exif} />}
                {exifError && !exif && (
                  <div className={styles.exifError}>{exifError}</div>
                )}
              </div>

              {hist && (
                <div className={styles.histogramGrid}>
                  {HISTOGRAM_MODE_KEYS.map((m) => (
                    <HistogramCard key={m.key} hist={hist} mode={m.key} label={t(m.labelKey as Parameters<typeof t>[0])} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyMain}>{t('uploadPrompt')}</div>
          )}
        </div>

        <div className={styles.desktopOnly}>
          <LearnPanel slug="exif-viewer" />
        </div>
      </div>

      <div className={styles.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>

      <div className={styles.mobileOnly}>
        <LearnPanel slug="exif-viewer" />
      </div>
    </div>
  )
}
