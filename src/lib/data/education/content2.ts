import type { ToolEducationSkeleton } from './types'
import { FRAME_STUDIO_SKELETON } from './frame-studio'
import { HYPERFOCAL_SKELETON, SENSOR_SIZE_SKELETON } from './content-hyperfocal-sensor'
import { EXIF_VIEWER_SKELETON, HISTOGRAM_SKELETON } from './content-exif-histogram'
import { COLOR_SCHEME_SKELETON, FOV_SIMULATOR_SKELETON } from './content-color-fov'

export const TOOL_EDUCATION_SKELETONS_2: ToolEducationSkeleton[] = [
  HYPERFOCAL_SKELETON,
  SENSOR_SIZE_SKELETON,
  EXIF_VIEWER_SKELETON,
  HISTOGRAM_SKELETON,
  COLOR_SCHEME_SKELETON,
  FOV_SIMULATOR_SKELETON,
  FRAME_STUDIO_SKELETON,
]
