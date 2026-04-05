'use client'

import { useTranslations } from 'next-intl'
import { DASH } from './exifTypes'
import type { ExifResult } from './exifTypes'
import styles from './ExifViewer.module.css'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td className={value === DASH ? styles.missing : undefined}>{value}</td>
    </tr>
  )
}

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
        </tbody>
      </table>
    </div>
  )
}

export function AnalysisCards({ analysis }: { analysis: ExifResult['analysis'] }) {
  const t = useTranslations('toolUI.exif-viewer')
  if (!analysis.ev && !analysis.diffractionWarning) return null
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('analysis')}</div>
      {analysis.ev && (
        <div className={styles.analysisCard}>
          <div className={styles.analysisLabel}>{t('exposureValue')}</div>
          <div className={styles.analysisValue}>{analysis.ev}</div>
          {analysis.evDescription && <div className={styles.analysisNote}>{t(analysis.evDescription as Parameters<typeof t>[0])}</div>}
        </div>
      )}
      {analysis.diffractionWarning && (
        <div className={styles.warningCard}>{analysis.diffractionWarning}</div>
      )}
    </div>
  )
}

export function ExifSectionsGrid({ data }: { data: ExifResult }) {
  const t = useTranslations('toolUI.exif-viewer')
  return (
    <div className={styles.sectionsGrid}>
      <Section title={t('sectionCamera')} rows={[
        [t('make'), data.camera.make],
        [t('model'), data.camera.model],
      ]} />
      <Section title={t('sectionLens')} rows={[
        [t('lensModel'), data.lens.model],
        [t('lensMake'), data.lens.make],
      ]} />
      <Section title={t('sectionExposure')} rows={[
        [t('apertureLabel'), data.settings.fNumber],
        [t('shutterSpeed'), data.settings.exposureTime],
        [t('isoLabel'), data.settings.iso],
        [t('focalLengthLabel'), data.settings.focalLength],
        [t('equiv35mm'), data.settings.focalLength35],
        [t('program'), data.settings.exposureProgram],
        [t('metering'), data.settings.meteringMode],
        [t('flash'), data.settings.flash],
        [t('whiteBalance'), data.settings.whiteBalance],
        [t('focusDistanceLabel'), data.settings.focusDistance],
      ]} />
      <Section title={t('sectionImage')} rows={[
        [t('dimensions'), data.image.widthRaw && data.image.heightRaw ? `${data.image.width} × ${data.image.height}` : DASH],
        [t('megapixels'), data.image.megapixels],
        [t('aspectRatio'), data.image.aspectRatio],
        [t('colorSpace'), data.image.colorSpace],
        [t('orientation'), data.image.orientation],
        [t('fileSize'), data.file.size],
      ]} />
      <Section title={t('sectionDate')} rows={[[t('dateTaken'), data.date]]} />
      {data.gps && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('sectionGPS')}</div>
          <div className={styles.gpsWarning} role="alert">
            {t('gpsWarning')}
          </div>
          <table className={styles.table}>
            <tbody>
              <Row label={t('latitudeLabel')} value={data.gps.latitude} />
              <Row label={t('longitudeLabel')} value={data.gps.longitude} />
            </tbody>
          </table>
        </div>
      )}
      <Section title={t('sectionSoftware')} rows={[[t('softwareLabel'), data.software]]} />
    </div>
  )
}
