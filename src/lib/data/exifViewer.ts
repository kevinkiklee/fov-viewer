export const EXPOSURE_PROGRAMS: Record<string, string> = {
  '0': 'Not defined', '1': 'Manual', '2': 'Program AE', '3': 'Aperture Priority',
  '4': 'Shutter Priority', '5': 'Creative', '6': 'Action', '7': 'Portrait', '8': 'Landscape',
}

export const METERING_MODES: Record<string, string> = {
  '0': 'Unknown', '1': 'Average', '2': 'Center-weighted', '3': 'Spot',
  '4': 'Multi-spot', '5': 'Multi-segment', '6': 'Partial',
}

export const FLASH_MODES: Record<number, string> = {
  0x00: 'No flash', 0x01: 'Flash fired', 0x05: 'Flash fired, strobe return not detected',
  0x07: 'Flash fired, strobe return detected', 0x08: 'Flash did not fire, compulsory',
  0x09: 'Flash fired, compulsory', 0x10: 'Flash did not fire, compulsory suppressed',
  0x18: 'Flash did not fire, auto', 0x19: 'Flash fired, auto',
  0x20: 'No flash function', 0x41: 'Flash fired, red-eye reduction',
}

export const WHITE_BALANCE: Record<string, string> = { '0': 'Auto', '1': 'Manual' }
export const COLOR_SPACES: Record<string, string> = { '1': 'sRGB', '2': 'Adobe RGB', '65535': 'Uncalibrated' }
