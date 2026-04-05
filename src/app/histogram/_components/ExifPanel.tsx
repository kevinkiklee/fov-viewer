'use client'

import { useTranslations } from 'next-intl'
import { DASH, type ExifResult } from './exifHelpers'
import styles from './HistogramExplainer.module.css'

function ExifRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td className={value === DASH ? styles.missing : undefined}>{value}</td>
    </tr>
  )
}

function ExifSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className={styles.exifSection}>
      <div className={styles.exifSectionTitle}>{title}</div>
      <table className={styles.exifTable}>
        <tbody>
          {rows.map(([label, value]) => (
            <ExifRow key={label} label={label} value={value} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ExifPanel({ data }: { data: ExifResult }) {
  const t = useTranslations('toolUI.histogram')
  return (
    <div className={styles.exifPanel}>
      <ExifSection title={t('sectionCamera')} rows={[[t('make'), data.camera.make], [t('model'), data.camera.model]]} />
      <ExifSection title={t('sectionLens')} rows={[[t('lensModel'), data.lens.model], [t('lensMake'), data.lens.make]]} />
      <ExifSection
        title={t('sectionSettings')}
        rows={[
          [t('apertureLabel'), data.settings.fNumber],
          [t('shutterSpeed'), data.settings.exposureTime],
          [t('isoLabel'), data.settings.iso],
          [t('focalLengthLabel'), data.settings.focalLength],
          [t('focalLength35mm'), data.settings.focalLength35],
        ]}
      />
      <ExifSection
        title={t('sectionImage')}
        rows={[
          [t('width'), data.image.width],
          [t('height'), data.image.height],
          [t('orientationLabel'), data.image.orientation],
        ]}
      />
      <ExifSection title={t('sectionDate')} rows={[[t('dateTaken'), data.date]]} />
      {data.gps && (
        <ExifSection title={t('sectionGPS')} rows={[[t('latitudeLabel'), data.gps.latitude], [t('longitudeLabel'), data.gps.longitude]]} />
      )}
      <ExifSection title={t('sectionSoftware')} rows={[[t('softwareLabel'), data.software]]} />
    </div>
  )
}
