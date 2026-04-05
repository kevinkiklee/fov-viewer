'use client'

import { useState } from 'react'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { SHUTTER_PRESETS } from './shutter-data'
import { MotionCanvas } from './MotionCanvas'
import { ShutterControlsPanel } from './ShutterControlsPanel'
import ss from './ShutterSpeedGuide.module.css'

export function ShutterSpeedGuide() {
  const [shutterIdx, setShutterIdx] = useState(8)

  return (
    <div className={ss.app}>
      <div className={ss.appBody}>
        <div className={ss.sidebar}>
          <ToolActions toolName="Shutter Speed Visualizer" toolSlug="shutter-speed-visualizer" />
          <ShutterControlsPanel shutterIdx={shutterIdx} onShutterChange={setShutterIdx} />
        </div>

        <div className={ss.main}>
          <MotionCanvas shutterSpeed={SHUTTER_PRESETS[shutterIdx].value} />
        </div>

        <div className={ss.desktopOnly}>
          <LearnPanel slug="shutter-speed-visualizer" />
        </div>
      </div>

      <div className={ss.mobileControls}>
        <ShutterControlsPanel shutterIdx={shutterIdx} onShutterChange={setShutterIdx} />
      </div>

      <div className={ss.mobileOnly}>
        <LearnPanel slug="shutter-speed-visualizer" />
      </div>
    </div>
  )
}
