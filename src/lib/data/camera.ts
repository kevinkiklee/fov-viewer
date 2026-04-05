export const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
export const SHUTTER_SPEEDS = [30, 15, 8, 4, 2, 1, 1/2, 1/4, 1/8, 1/15, 1/30, 1/60, 1/125, 1/250, 1/500, 1/1000, 1/2000, 1/4000, 1/8000]
export const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600]

/** Full 1/3-stop aperture scale for fine-grained DOF control */
export const APERTURES_THIRD_STOP = [
  1, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5,
  5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36,
  40, 45, 51, 57, 64,
]

/** Full-stop apertures for display tick labels */
export const APERTURES_FULL_STOP = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32, 45, 64]
