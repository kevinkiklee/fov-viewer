export const BASE_SHUTTER_SPEEDS = [
  { label: '1/8000', value: 1 / 8000 },
  { label: '1/4000', value: 1 / 4000 },
  { label: '1/2000', value: 1 / 2000 },
  { label: '1/1000', value: 1 / 1000 },
  { label: '1/500', value: 1 / 500 },
  { label: '1/250', value: 1 / 250 },
  { label: '1/125', value: 1 / 125 },
  { label: '1/60', value: 1 / 60 },
  { label: '1/30', value: 1 / 30 },
  { label: '1/15', value: 1 / 15 },
  { label: '1/8', value: 1 / 8 },
  { label: '1/4', value: 1 / 4 },
  { label: '1/2', value: 1 / 2 },
  { label: '1s', value: 1 },
  { label: '2s', value: 2 },
  { label: '4s', value: 4 },
]

export const ND_FILTERS = [
  { label: 'ND2 (1 stop)', factor: 2, stops: 1 },
  { label: 'ND4 (2 stops)', factor: 4, stops: 2 },
  { label: 'ND8 (3 stops)', factor: 8, stops: 3 },
  { label: 'ND16 (4 stops)', factor: 16, stops: 4 },
  { label: 'ND32 (5 stops)', factor: 32, stops: 5 },
  { label: 'ND64 (6 stops)', factor: 64, stops: 6 },
  { label: 'ND128 (7 stops)', factor: 128, stops: 7 },
  { label: 'ND256 (8 stops)', factor: 256, stops: 8 },
  { label: 'ND512 (9 stops)', factor: 512, stops: 9 },
  { label: 'ND1024 (10 stops)', factor: 1024, stops: 10 },
]

export const TABLE_FILTERS = ND_FILTERS.filter((f) => [3, 6, 10].includes(f.stops))
