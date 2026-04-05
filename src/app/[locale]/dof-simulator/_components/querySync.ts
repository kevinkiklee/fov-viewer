import { intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import type { SubjectMode, ABMode, BokehShape, DofSceneKey } from '@/lib/data/dofSimulator'
import { DOF_SCENES } from '@/lib/data/dofSimulator'

const sceneKeys = DOF_SCENES.map((s) => s.key) as DofSceneKey[]

export const PARAM_SCHEMA = {
  fl: intParam(85, 8, 800),
  f: numParam(2.8, 1, 64),
  d: numParam(3, 0.1, 100),
  s: sensorParam('ff'),
  scene: strParam<string>('park-portrait', sceneKeys),
  mode: strParam<SubjectMode>('figure', ['figure', 'target']),
  orient: strParam<'landscape' | 'portrait'>('landscape', ['landscape', 'portrait']),
  bokeh: strParam<BokehShape>('disc', ['disc', 'blade5', 'blade6', 'blade7', 'blade8', 'blade9', 'cata']),
  ab: strParam<ABMode>('off', ['off', 'wipe', 'split']),
  // B settings
  b_fl: intParam(50, 8, 800),
  b_f: numParam(5.6, 1, 64),
  b_d: numParam(3, 0.1, 100),
  b_s: sensorParam('ff'),
}
