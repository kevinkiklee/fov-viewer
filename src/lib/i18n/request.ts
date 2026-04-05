import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  const locale = 'en'

  const [
    common,
    home,
    tools,
    glossary,
    about,
    contact,
    privacy,
    terms,
    metadata,
    // Education files
    eduDofCalculator,
    eduFovSimulator,
    eduExposureSimulator,
    eduStarTrailCalculator,
    eduWhiteBalanceVisualizer,
    eduHyperfocalSimulator,
    eduShutterSpeedVisualizer,
    eduSensorSizeComparison,
    eduNdFilterCalculator,
    eduPerspectiveCompressionSimulator,
    eduColorSchemeGenerator,
    eduExifViewer,
    eduHistogram,
    eduFrameStudio,
    // Tool UI files
    toolDofCalculator,
    toolFovSimulator,
    toolExposureSimulator,
    toolFrameStudio,
    toolStarTrailCalculator,
    toolWhiteBalanceVisualizer,
    toolHyperfocalSimulator,
    toolShutterSpeedVisualizer,
    toolSensorSizeComparison,
    toolColorSchemeGenerator,
    toolPerspectiveCompressionSimulator,
    toolExifViewer,
    toolNdFilterCalculator,
    toolHistogram,
  ] = await Promise.all([
    import(`./messages/${locale}/common.json`),
    import(`./messages/${locale}/home.json`),
    import(`./messages/${locale}/tools.json`),
    import(`./messages/${locale}/glossary.json`),
    import(`./messages/${locale}/about.json`),
    import(`./messages/${locale}/contact.json`),
    import(`./messages/${locale}/privacy.json`),
    import(`./messages/${locale}/terms.json`),
    import(`./messages/${locale}/metadata.json`),
    // Education files
    import(`./messages/${locale}/education/dof-calculator.json`),
    import(`./messages/${locale}/education/fov-simulator.json`),
    import(`./messages/${locale}/education/exposure-simulator.json`),
    import(`./messages/${locale}/education/star-trail-calculator.json`),
    import(`./messages/${locale}/education/white-balance-visualizer.json`),
    import(`./messages/${locale}/education/hyperfocal-simulator.json`),
    import(`./messages/${locale}/education/shutter-speed-visualizer.json`),
    import(`./messages/${locale}/education/sensor-size-comparison.json`),
    import(`./messages/${locale}/education/nd-filter-calculator.json`),
    import(`./messages/${locale}/education/perspective-compression-simulator.json`),
    import(`./messages/${locale}/education/color-scheme-generator.json`),
    import(`./messages/${locale}/education/exif-viewer.json`),
    import(`./messages/${locale}/education/histogram.json`),
    import(`./messages/${locale}/education/frame-studio.json`),
    // Tool UI files
    import(`./messages/${locale}/tools/dof-calculator.json`),
    import(`./messages/${locale}/tools/fov-simulator.json`),
    import(`./messages/${locale}/tools/exposure-simulator.json`),
    import(`./messages/${locale}/tools/frame-studio.json`),
    import(`./messages/${locale}/tools/star-trail-calculator.json`),
    import(`./messages/${locale}/tools/white-balance-visualizer.json`),
    import(`./messages/${locale}/tools/hyperfocal-simulator.json`),
    import(`./messages/${locale}/tools/shutter-speed-visualizer.json`),
    import(`./messages/${locale}/tools/sensor-size-comparison.json`),
    import(`./messages/${locale}/tools/color-scheme-generator.json`),
    import(`./messages/${locale}/tools/perspective-compression-simulator.json`),
    import(`./messages/${locale}/tools/exif-viewer.json`),
    import(`./messages/${locale}/tools/nd-filter-calculator.json`),
    import(`./messages/${locale}/tools/histogram.json`),
  ])

  // Merge all tool UI messages into a single toolUI namespace
  const toolUIMessages = [
    toolDofCalculator, toolFovSimulator, toolExposureSimulator, toolFrameStudio,
    toolStarTrailCalculator, toolWhiteBalanceVisualizer, toolHyperfocalSimulator,
    toolShutterSpeedVisualizer, toolSensorSizeComparison, toolColorSchemeGenerator,
    toolPerspectiveCompressionSimulator, toolExifViewer, toolNdFilterCalculator,
    toolHistogram,
  ].reduce((acc, mod) => {
    const data = mod.default
    if (data.toolUI) {
      acc.toolUI = { ...acc.toolUI, ...data.toolUI }
    }
    return acc
  }, { toolUI: {} } as { toolUI: Record<string, unknown> })

  // Merge all education messages into a single education namespace
  const educationMessages = [
    eduDofCalculator, eduFovSimulator, eduExposureSimulator, eduStarTrailCalculator,
    eduWhiteBalanceVisualizer, eduHyperfocalSimulator, eduShutterSpeedVisualizer,
    eduSensorSizeComparison, eduNdFilterCalculator, eduPerspectiveCompressionSimulator,
    eduColorSchemeGenerator, eduExifViewer, eduHistogram, eduFrameStudio,
  ].reduce((acc, mod) => {
    const data = mod.default
    if (data.education) {
      acc.education = { ...acc.education, ...data.education }
    }
    return acc
  }, { education: {} } as { education: Record<string, unknown> })

  return {
    locale,
    messages: {
      ...common.default,
      ...home.default,
      ...tools.default,
      ...glossary.default,
      ...about.default,
      ...contact.default,
      ...privacy.default,
      ...terms.default,
      ...metadata.default,
      ...educationMessages,
      ...toolUIMessages,
    },
  }
})
