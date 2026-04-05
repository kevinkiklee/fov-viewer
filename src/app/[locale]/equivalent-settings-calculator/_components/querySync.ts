import { intParam, numParam, sensorParam } from '@/lib/utils/querySync'
import { SENSORS } from '@/lib/data/sensors'

const sensorIds = SENSORS.map((s) => s.id)

export const PARAM_SCHEMA = {
  fl: intParam(85, 8, 800),
  f: numParam(1.4, 1, 64),
  d: numParam(3, 0.3, 100),
  s: sensorParam('ff'),
  targets: {
    default: 'apsc_n,m43',
    parse: (raw: string) => {
      const ids = raw.split(',').filter((id) => sensorIds.includes(id))
      return ids.length > 0 ? ids.join(',') : undefined
    },
    serialize: (val: string) => val,
  },
}
