import type { ToolEducation } from './types'

export const TOOL_EDUCATION_2: ToolEducation[] = [
  // ── Tool 8: Hyperfocal Distance Table ──────────────────────────────
  {
    slug: 'hyperfocal-simulator',
    beginner:
      'The hyperfocal distance is the closest point you can focus on while still keeping everything at infinity acceptably sharp. When you focus at the hyperfocal distance, your depth of field extends from half that distance all the way to infinity. Landscape photographers use this technique to maximize sharpness from foreground to horizon.',
    deeper:
      'Hyperfocal distance is derived from the thin-lens equation and the concept of the circle of confusion (CoC). It equals the focal length squared divided by the product of the f-number and the CoC diameter: H = f² / (N × c). Anything from H/2 to infinity falls within acceptable sharpness. The CoC depends on sensor size — smaller sensors have a smaller acceptable CoC, which pushes the hyperfocal distance farther away for the same focal length and aperture. This is why crop-sensor cameras appear to have greater depth of field: the CoC standard is tighter relative to the image area. In practice, diffraction softening at very small apertures (f/16 and beyond on most sensors) means there is a trade-off between maximizing depth of field and maintaining per-pixel sharpness.',
    keyFactors: [
      { label: 'Focal Length', description: 'Longer focal lengths dramatically increase hyperfocal distance — it scales with the square of focal length.' },
      { label: 'Aperture', description: 'Smaller apertures (higher f-numbers) reduce hyperfocal distance, extending depth of field.' },
      { label: 'Sensor Size', description: 'Smaller sensors use a smaller circle of confusion, which increases hyperfocal distance for equivalent framing.' },
      { label: 'Circle of Confusion', description: 'The maximum blur spot diameter considered "acceptably sharp" — typically 0.03mm for full frame.' },
    ],
    tips: [
      { text: 'For quick landscape work, focus roughly one-third into the scene — it approximates the hyperfocal point for most wide-angle setups.' },
      { text: 'Avoid stopping down past f/16 on full-frame or f/11 on APS-C. Diffraction will undo the depth-of-field gains you are chasing.' },
      { text: 'Use live view magnification to nail focus precisely at the hyperfocal distance rather than relying on the lens distance scale, which is often imprecise on modern autofocus lenses.' },
    ],
    tooltips: {
      Sensor: {
        term: 'Sensor',
        definition: 'The camera sensor format. Smaller sensors have a tighter circle of confusion standard, which shifts all hyperfocal distances farther away.',
      },
    },
    challenges: [
      {
        id: 'hyp-beginner-1',
        difficulty: 'beginner',
        scenario: 'You are shooting a landscape with a 24mm lens on a full-frame camera. Which sensor format should you select to see full-frame hyperfocal distances?',
        hint: 'Full frame is the standard 35mm sensor size.',
        successMessage: 'Correct! Full Frame is the right choice for a standard 35mm sensor.',
        failureMessage: 'Not quite — select the Full Frame sensor to match a standard 35mm camera body.',
        targetField: 'sensor',
        options: [
          { label: 'Full Frame', value: 'ff' },
          { label: 'APS-C (Nikon/Sony)', value: 'apsc' },
          { label: 'Micro Four Thirds', value: 'm43' },
        ],
        correctOption: 'ff',
      },
      {
        id: 'hyp-beginner-2',
        difficulty: 'beginner',
        scenario: 'Looking at the table for full frame, which has a shorter hyperfocal distance: 24mm at f/8, or 50mm at f/8?',
        hint: 'Hyperfocal distance increases with the square of the focal length.',
        successMessage: 'Right! The 24mm lens has a much shorter hyperfocal distance because focal length has a squared relationship.',
        failureMessage: 'Actually, shorter focal lengths always yield shorter hyperfocal distances. The 24mm wins here.',
        targetField: 'focalLength',
        options: [
          { label: '24mm at f/8', value: '24' },
          { label: '50mm at f/8', value: '50' },
        ],
        correctOption: '24',
      },
      {
        id: 'hyp-intermediate-1',
        difficulty: 'intermediate',
        scenario: 'You are hiking with an APS-C camera and a 35mm lens. You want everything from about 3 meters to infinity sharp. Which aperture range should you look at in the table to find a hyperfocal distance near 6 meters (so that half of it — 3m — is your near-focus limit)?',
        hint: 'Remember: near focus = hyperfocal / 2. Look for an aperture that gives a hyperfocal around 6m.',
        successMessage: 'Great thinking! You correctly identified that you need a hyperfocal distance of about 6m, and found the right aperture range.',
        failureMessage: 'Remember, near focus equals half the hyperfocal distance. You need the hyperfocal to be around 6m to get a near-focus limit of 3m.',
        targetField: 'aperture',
        options: [
          { label: 'f/2.8 — f/4', value: 'wide' },
          { label: 'f/5.6 — f/8', value: 'mid' },
          { label: 'f/16 — f/22', value: 'narrow' },
        ],
        correctOption: 'mid',
      },
      {
        id: 'hyp-intermediate-2',
        difficulty: 'intermediate',
        scenario: 'A friend switches from a full-frame camera to Micro Four Thirds but keeps shooting the same focal lengths. They complain that the hyperfocal distances seem different. Why?',
        hint: 'The circle of confusion is calculated based on sensor size.',
        successMessage: 'Exactly! The smaller M43 sensor uses a smaller CoC (about 0.015mm vs 0.03mm), which increases hyperfocal distances for the same focal length and aperture.',
        failureMessage: 'The key factor is the circle of confusion. Smaller sensors require a tighter CoC standard, which pushes hyperfocal distances farther out.',
        targetField: 'sensor',
        options: [
          { label: 'The lens focal length changes on crop sensors', value: 'focal' },
          { label: 'Smaller sensors use a smaller circle of confusion', value: 'coc' },
          { label: 'Micro Four Thirds cameras have less accurate autofocus', value: 'af' },
        ],
        correctOption: 'coc',
      },
      {
        id: 'hyp-advanced-1',
        difficulty: 'advanced',
        scenario: 'You are shooting architecture at 14mm f/11 on full frame. The table shows a very short hyperfocal distance. Should you stop down further to f/22 for even more depth of field, or is f/11 the better choice?',
        hint: 'Consider what happens to image sharpness at very small apertures.',
        successMessage: 'Excellent! At f/11, diffraction is minimal on full frame, and the hyperfocal distance at 14mm is already very short. Stopping down to f/22 would soften the image due to diffraction without meaningful DoF benefit.',
        failureMessage: 'While f/22 gives a shorter hyperfocal distance on paper, diffraction softening at f/22 on full frame actually reduces overall image sharpness. At 14mm f/11, the hyperfocal distance is already so short that the extra DoF is not worth the diffraction penalty.',
        targetField: 'aperture',
        options: [
          { label: 'Stop down to f/22 for maximum depth of field', value: 'f22' },
          { label: 'Stay at f/11 — diffraction at f/22 will reduce sharpness', value: 'f11' },
        ],
        correctOption: 'f11',
      },
    ],
  },

  // ── Tool 10: Sensor Size Comparison ────────────────────────────────
  {
    slug: 'sensor-size',
    beginner:
      'Camera sensors come in many different physical sizes, from the large medium-format chips used in studio cameras down to the tiny sensors in smartphones. A larger sensor captures more light, produces less noise, and makes it easier to blur backgrounds. Sensor size is one of the biggest factors separating camera categories.',
    deeper:
      'Sensor size affects photography in several interconnected ways. A larger sensor has a bigger area to collect photons, improving signal-to-noise ratio and dynamic range. The "crop factor" describes how a sensor compares to the 35mm full-frame standard: an APS-C sensor with a 1.5x crop factor gives the same field of view with a 35mm lens as a full-frame camera would with a 52.5mm lens. This crop factor also multiplies the effective depth of field — a smaller sensor appears to give more depth of field at the same framing because you need a wider (shorter) lens to match the field of view. Pixel density (pixel pitch) is another key metric: packing more megapixels onto a smaller sensor shrinks each photosite, reducing per-pixel light gathering. A 24MP full-frame sensor has ~6µm pixels while a 24MP APS-C sensor has ~4µm pixels, which is why the full-frame sensor typically performs better at high ISO.',
    keyFactors: [
      { label: 'Physical Dimensions', description: 'Width and height in millimeters determine the total light-gathering area and the field of view for a given lens.' },
      { label: 'Crop Factor', description: 'The ratio of the full-frame diagonal to the sensor diagonal. Multiplied by focal length, it gives the "equivalent" focal length.' },
      { label: 'Pixel Density', description: 'How tightly pixels are packed. Smaller pixel pitch means more detail but less light per pixel, affecting noise performance.' },
      { label: 'Sensor Area', description: 'Total area in mm². A medium format sensor has roughly 1.7x the area of full frame, and about 13x the area of a smartphone sensor.' },
    ],
    tips: [
      { text: 'Use the overlay mode to see exactly how much bigger one sensor is than another — the area difference is often more dramatic than the numbers suggest.' },
      { text: 'Switch to pixel density mode and enter your camera resolution to compare pixel pitch. If your camera has very high pixel density, you may hit diffraction limits at wider apertures than expected.' },
      { text: 'When comparing cameras, sensor area matters more than megapixel count for noise performance. A 20MP full-frame sensor will typically outperform a 40MP APS-C sensor at high ISO.' },
    ],
    tooltips: {
      Sensor: {
        term: 'Sensor',
        definition: 'Toggle individual sensor formats on or off to include them in the visual comparison and data table.',
      },
      'Display Mode': {
        term: 'Display Mode',
        definition: 'Overlay shows all sensors centered on the same point. Side by Side places them next to each other at the same scale. Pixel Density visualizes how tightly pixels are packed.',
      },
      Resolution: {
        term: 'Resolution',
        definition: 'The total megapixel count used to calculate pixel pitch in pixel density mode. Higher megapixels on the same sensor size means smaller individual pixels.',
      },
      'Crop Factor': {
        term: 'Crop Factor',
        definition: 'The ratio of the 35mm full-frame diagonal to this sensor diagonal. A 1.5x crop factor means a 50mm lens frames like a 75mm lens on full frame.',
      },
    },
    challenges: [
      {
        id: 'ss-beginner-1',
        difficulty: 'beginner',
        scenario: 'You want to see how a smartphone sensor compares to full frame. Which two sensors should you enable in the comparison?',
        hint: 'Look for "Full Frame" and the smartphone option.',
        successMessage: 'Correct! Comparing Full Frame and Smartphone shows just how dramatic the size difference is — the full-frame sensor is over 13 times larger by area.',
        failureMessage: 'Enable "Full Frame" and "Smartphone (1/1.7\")" to see the comparison.',
        targetField: 'sensor',
        options: [
          { label: 'Full Frame + Smartphone', value: 'ff-phone' },
          { label: 'Medium Format + 1" Sensor', value: 'mf-1in' },
          { label: 'APS-C + Micro Four Thirds', value: 'apsc-m43' },
        ],
        correctOption: 'ff-phone',
      },
      {
        id: 'ss-beginner-2',
        difficulty: 'beginner',
        scenario: 'Which display mode best shows the relative physical sizes of sensors at a glance?',
        hint: 'One mode draws all the sensor rectangles on top of each other.',
        successMessage: 'Right! Overlay mode centers all sensors on the same point, making relative size differences immediately visible.',
        failureMessage: 'The overlay mode is best for comparing relative sizes — it stacks all sensor outlines concentrically.',
        targetField: 'displayMode',
        options: [
          { label: 'Overlay', value: 'overlay' },
          { label: 'Side by Side', value: 'side-by-side' },
          { label: 'Pixel Density', value: 'pixel-density' },
        ],
        correctOption: 'overlay',
      },
      {
        id: 'ss-intermediate-1',
        difficulty: 'intermediate',
        scenario: 'You are deciding between a 24MP full-frame camera and a 24MP APS-C camera. Which display mode would help you understand why the full-frame camera has better high-ISO performance?',
        hint: 'Think about what determines noise: the size of each individual pixel.',
        successMessage: 'Excellent! Pixel Density mode shows that at the same megapixel count, the full-frame sensor has larger pixels (higher pixel pitch), which gather more light per pixel.',
        failureMessage: 'Pixel Density mode is the answer — it reveals that full-frame pixels are physically larger at 24MP, explaining the noise advantage.',
        targetField: 'displayMode',
        options: [
          { label: 'Overlay', value: 'overlay' },
          { label: 'Side by Side', value: 'side-by-side' },
          { label: 'Pixel Density', value: 'pixel-density' },
        ],
        correctOption: 'pixel-density',
      },
      {
        id: 'ss-intermediate-2',
        difficulty: 'intermediate',
        scenario: 'Looking at the comparison table, which sensor format has a crop factor closest to 2.0x?',
        hint: 'Crop factor is the full-frame diagonal divided by the sensor diagonal.',
        successMessage: 'Correct! Micro Four Thirds has a crop factor of 2.0x, which is why a 25mm M43 lens frames like a 50mm on full frame.',
        failureMessage: 'Micro Four Thirds has a 2.0x crop factor. Check the table — its diagonal is exactly half the full-frame diagonal.',
        targetField: 'sensor',
        options: [
          { label: 'APS-C (Canon)', value: 'apsc_c' },
          { label: 'Micro Four Thirds', value: 'm43' },
          { label: '1" Sensor', value: '1in' },
        ],
        correctOption: 'm43',
      },
      {
        id: 'ss-advanced-1',
        difficulty: 'advanced',
        scenario: 'You are comparing a 50MP medium format camera to a 50MP full-frame camera using pixel density mode. Both have the same megapixel count. Which camera has the larger pixel pitch, and what practical advantage does that give?',
        hint: 'Pixel pitch depends on sensor width divided by the number of horizontal pixels.',
        successMessage: 'Right! The medium format sensor is physically larger, so at 50MP its pixels are bigger (higher pitch). This gives it about 1/3 stop better light gathering per pixel, plus slightly later diffraction onset.',
        failureMessage: 'The medium format sensor is larger, so at the same resolution each pixel is physically bigger. Larger pixels collect more photons, giving better dynamic range and slightly later diffraction limits.',
        targetField: 'sensor',
        options: [
          { label: 'Medium Format — better per-pixel light gathering and dynamic range', value: 'mf' },
          { label: 'Full Frame — smaller pixels are more efficient', value: 'ff' },
          { label: 'Both are identical since they have the same megapixel count', value: 'same' },
        ],
        correctOption: 'mf',
      },
    ],
  },

  // ── Tool 11: EXIF Viewer ───────────────────────────────────────────
  {
    slug: 'exif-viewer',
    beginner:
      'EXIF data is hidden information embedded in every photo your camera takes. It records what camera and lens you used, the exact settings (aperture, shutter speed, ISO), the date and time, and sometimes even GPS coordinates. This tool reads that data without uploading your photo anywhere — everything happens in your browser.',
    deeper:
      'EXIF (Exchangeable Image File Format) is a standard defined by JEITA/CIPA that stores metadata in JPEG, TIFF, and some RAW files. The data is written into specific segments of the file header as tagged key-value pairs using a TIFF-based IFD (Image File Directory) structure. There are several IFD sections: IFD0 for basic image info, the EXIF sub-IFD for camera settings, the GPS IFD for geolocation, and the Interop IFD for compatibility data. Camera manufacturers also write proprietary "MakerNote" data containing lens corrections, focus points, shutter count, and other model-specific details. Social media platforms often strip EXIF data on upload for privacy, but the original file on your memory card always retains it. Understanding EXIF helps you learn from your own shooting patterns and reverse-engineer the settings behind photos you admire.',
    keyFactors: [
      { label: 'Camera & Lens', description: 'Make, model, lens name, and lens manufacturer — useful for identifying gear in photos you find online.' },
      { label: 'Exposure Settings', description: 'Aperture, shutter speed, ISO, and focal length — the core shooting parameters recorded for every frame.' },
      { label: 'Date & GPS', description: 'When and where the photo was taken. Be mindful that GPS data reveals your location when sharing files.' },
      { label: 'Software', description: 'Shows which editing software last saved the file. Useful for checking if an image has been processed.' },
    ],
    tips: [
      { text: 'Check the focal length and 35mm equivalent to understand whether the photographer used a wide, normal, or telephoto perspective — this teaches composition more than any rule of thirds.' },
      { text: 'If a photo you admire was shot at high ISO with a wide aperture, that tells you it was a low-light situation. Use EXIF to understand the constraints the photographer faced.' },
      { text: 'Before sharing photos online, be aware that EXIF may contain your GPS location. Strip metadata using your editing software export settings if privacy is a concern.' },
    ],
    tooltips: {
      Make: {
        term: 'Make',
        definition: 'The camera manufacturer name (e.g., Canon, Nikon, Sony) stored in the EXIF header.',
      },
      Model: {
        term: 'Model',
        definition: 'The specific camera model (e.g., "EOS R5", "Z 9") that captured the image.',
      },
      Aperture: {
        term: 'Aperture',
        definition: 'The f-number the lens was set to. Lower numbers mean wider aperture and more light.',
      },
      'Shutter Speed': {
        term: 'Shutter Speed',
        definition: 'How long the sensor was exposed. Expressed as a fraction (e.g., 1/250s) or whole seconds for long exposures.',
      },
      ISO: {
        term: 'ISO',
        definition: 'The sensor sensitivity setting. Higher ISO brightens the image but adds noise.',
      },
      'Focal Length': {
        term: 'Focal Length',
        definition: 'The actual focal length of the lens in millimeters.',
      },
      'Focal Length (35mm equiv.)': {
        term: 'Focal Length (35mm equiv.)',
        definition: 'The equivalent focal length as if shot on a full-frame 35mm sensor. Useful for comparing field of view across sensor sizes.',
      },
      GPS: {
        term: 'GPS',
        definition: 'Latitude and longitude coordinates embedded by cameras with GPS modules. Reveals where the photo was taken.',
      },
    },
    challenges: [
      {
        id: 'exif-beginner-1',
        difficulty: 'beginner',
        scenario: 'You found a stunning photo online and want to know what lens was used. Which EXIF section would tell you?',
        hint: 'Camera and lens info are in different sections.',
        successMessage: 'Correct! The Lens section shows the lens model and manufacturer.',
        failureMessage: 'The Lens section contains the lens model — check there to identify the glass used.',
        targetField: 'section',
        options: [
          { label: 'Camera', value: 'camera' },
          { label: 'Lens', value: 'lens' },
          { label: 'Settings', value: 'settings' },
        ],
        correctOption: 'lens',
      },
      {
        id: 'exif-beginner-2',
        difficulty: 'beginner',
        scenario: 'You uploaded a photo and see Aperture: f/1.8, Shutter Speed: 1/4000s, ISO: 100. Was this likely shot in bright or dim light?',
        hint: 'A very fast shutter speed at low ISO suggests lots of available light.',
        successMessage: 'Right! The fast shutter speed (1/4000s) at base ISO (100) tells you there was plenty of light — likely bright outdoors.',
        failureMessage: 'A shutter speed of 1/4000s at ISO 100 means the camera needed very little sensitivity and very short exposure. That is a bright outdoor scene.',
        targetField: 'lightLevel',
        options: [
          { label: 'Bright light — fast shutter at low ISO', value: 'bright' },
          { label: 'Dim light — the wide aperture compensates', value: 'dim' },
        ],
        correctOption: 'bright',
      },
      {
        id: 'exif-intermediate-1',
        difficulty: 'intermediate',
        scenario: 'A photo shows Focal Length: 50mm and Focal Length (35mm equiv.): 75mm. What sensor was the camera using?',
        hint: 'The 35mm equivalent is the focal length multiplied by the crop factor.',
        successMessage: 'Correct! 75 / 50 = 1.5x crop factor, which is an APS-C sensor (Nikon/Sony variant).',
        failureMessage: 'Divide the 35mm equivalent by the actual focal length: 75 / 50 = 1.5x. That crop factor matches APS-C (Nikon/Sony).',
        targetField: 'sensor',
        options: [
          { label: 'Full Frame (1.0x crop)', value: 'ff' },
          { label: 'APS-C (1.5x crop)', value: 'apsc' },
          { label: 'Micro Four Thirds (2.0x crop)', value: 'm43' },
        ],
        correctOption: 'apsc',
      },
      {
        id: 'exif-intermediate-2',
        difficulty: 'intermediate',
        scenario: 'You see two photos of the same scene. Photo A: f/2.8, 1/60s, ISO 3200. Photo B: f/2.8, 1/60s, ISO 200. Which photo was taken in brighter light?',
        hint: 'Higher ISO compensates for less light.',
        successMessage: 'Exactly! Photo B at ISO 200 had much more ambient light. Photo A needed ISO 3200 (4 stops more sensitivity) to achieve the same exposure, meaning the scene was much darker.',
        failureMessage: 'Photo B was in brighter light. Same aperture and shutter speed, but ISO 200 vs 3200 means Photo A was in a much darker environment and needed 4 stops more sensor sensitivity.',
        targetField: 'photo',
        options: [
          { label: 'Photo A (ISO 3200)', value: 'a' },
          { label: 'Photo B (ISO 200)', value: 'b' },
        ],
        correctOption: 'b',
      },
      {
        id: 'exif-advanced-1',
        difficulty: 'advanced',
        scenario: 'You are analyzing a wildlife photo: 400mm, f/5.6, 1/2000s, ISO 1600. The EXIF shows the software field is "Adobe Lightroom Classic 13.1". What can you infer about the photographer and the shooting conditions?',
        hint: 'Consider the long focal length, wide-open aperture, fast shutter, and elevated ISO together.',
        successMessage: 'Great analysis! The 400mm at f/5.6 (likely wide open for that lens) with a fast 1/2000s shutter suggests a fast-moving subject (birds or wildlife in action). ISO 1600 indicates it was not bright sunlight — probably overcast or in shade. The Lightroom field confirms post-processing was done.',
        failureMessage: 'The settings reveal a lot: 400mm f/5.6 is a typical wildlife telephoto wide open, 1/2000s freezes fast animal movement, and ISO 1600 means light was limited (not bright sun). The Lightroom entry confirms the file was processed.',
        targetField: 'analysis',
        options: [
          { label: 'Fast subject in moderate light, post-processed in Lightroom', value: 'correct' },
          { label: 'Slow subject in bright light, straight from camera', value: 'wrong1' },
          { label: 'Landscape shot with motion blur, heavily edited', value: 'wrong2' },
        ],
        correctOption: 'correct',
      },
    ],
  },

  // ── Tool 12: Histogram Explainer ───────────────────────────────────
  {
    slug: 'histogram',
    beginner:
      'A histogram is a graph that shows how bright or dark the pixels in your photo are. The left side represents shadows (dark areas), the middle represents midtones, and the right side represents highlights (bright areas). If the graph is bunched up on one side, your photo may be underexposed or overexposed.',
    deeper:
      'A histogram plots pixel count (vertical axis) against brightness level (horizontal axis, 0-255 for 8-bit images). In luminance mode, each pixel brightness is calculated as a weighted average of red, green, and blue channels (typically 0.299R + 0.587G + 0.114B, matching human perception). RGB mode shows three separate distributions, revealing which color channels may be clipping independently — a red channel pushed to 255 while blue is fine indicates highlight clipping in warm tones, such as a sunset sky. "Clipping" occurs when pixel values hit the 0 or 255 boundary, meaning shadow or highlight detail has been irrecoverably lost. Black clipping (pixels at 0) loses shadow detail; white clipping (pixels at 255) loses highlight detail. Shooting RAW gives roughly 2-3 extra stops of recoverable highlight headroom beyond what the JPEG histogram shows, which is why many photographers "expose to the right" (ETTR) — pushing exposure as bright as possible without clipping the RAW data.',
    keyFactors: [
      { label: 'Tonal Distribution', description: 'The overall shape tells you whether the image is dark (left-heavy), bright (right-heavy), or balanced (spread across the range).' },
      { label: 'Clipping', description: 'Spikes at the far left or right edges indicate lost detail in shadows or highlights.' },
      { label: 'Channel Separation', description: 'RGB mode reveals individual color channel behavior — useful for detecting color-specific clipping in saturated scenes.' },
      { label: 'Dynamic Range', description: 'A histogram that spans the full width without clipping indicates good use of the available dynamic range.' },
    ],
    tips: [
      { text: 'There is no "perfect" histogram shape. A photo of a black cat on a dark couch should be left-heavy. Judge the histogram against your creative intent, not an ideal curve.' },
      { text: 'Check the RGB overlay mode for sunset and neon-light photos. The red channel often clips long before blue does, causing loss of detail in warm highlights even when the luminance histogram looks fine.' },
      { text: 'If you see clipping warnings on both ends simultaneously, the scene likely exceeds your camera dynamic range. Consider bracketing for HDR or using graduated ND filters.' },
    ],
    tooltips: {
      'View Mode': {
        term: 'View Mode',
        definition: 'Luminance shows overall brightness. RGB Overlay shows all three color channels overlaid. All Channels shows RGB plus luminance together.',
      },
      Shadows: {
        term: 'Shadows',
        definition: 'The leftmost region of the histogram (roughly 0-85), representing the darkest tones in the image.',
      },
      Midtones: {
        term: 'Midtones',
        definition: 'The center region (roughly 86-170), representing medium brightness — skin tones and most natural textures fall here.',
      },
      Highlights: {
        term: 'Highlights',
        definition: 'The rightmost region (roughly 171-255), representing the brightest tones: skies, reflections, and light sources.',
      },
      'Black Clipping': {
        term: 'Black Clipping',
        definition: 'The percentage of pixels at brightness 0 (pure black). High values mean shadow detail has been lost and cannot be recovered.',
      },
      'White Clipping': {
        term: 'White Clipping',
        definition: 'The percentage of pixels at brightness 255 (pure white). High values mean highlight detail has been blown out.',
      },
    },
    challenges: [
      {
        id: 'hist-beginner-1',
        difficulty: 'beginner',
        scenario: 'You upload a photo and the histogram is pushed heavily to the left with almost nothing on the right side. What does this tell you about the image?',
        hint: 'Left = dark, right = bright.',
        successMessage: 'Correct! A left-heavy histogram means the image is mostly dark tones — it may be underexposed, or it could be an intentionally dark/low-key image.',
        failureMessage: 'A histogram bunched to the left indicates the image is predominantly dark. This often means underexposure.',
        targetField: 'diagnosis',
        options: [
          { label: 'The image is underexposed or very dark', value: 'dark' },
          { label: 'The image is overexposed or very bright', value: 'bright' },
          { label: 'The image has perfect exposure', value: 'perfect' },
        ],
        correctOption: 'dark',
      },
      {
        id: 'hist-beginner-2',
        difficulty: 'beginner',
        scenario: 'Which view mode should you use to see the overall brightness distribution of your photo in a single graph?',
        hint: 'One mode combines all color information into a single brightness curve.',
        successMessage: 'Right! Luminance mode shows a single curve representing overall perceived brightness.',
        failureMessage: 'Luminance mode is the simplest view — it combines R, G, B into one brightness curve.',
        targetField: 'viewMode',
        options: [
          { label: 'Luminance', value: 'luminance' },
          { label: 'RGB Overlay', value: 'rgb' },
          { label: 'All Channels', value: 'channels' },
        ],
        correctOption: 'luminance',
      },
      {
        id: 'hist-intermediate-1',
        difficulty: 'intermediate',
        scenario: 'You shot a vivid sunset and the luminance histogram looks fine, but when you switch to RGB Overlay you see the red channel spiking at the far right. What is happening?',
        hint: 'Individual color channels can clip even when the overall luminance does not.',
        successMessage: 'Exactly! The red channel is clipping — the sunset highlights have lost detail in the red tones even though overall brightness looks acceptable. You are losing warm color nuances.',
        failureMessage: 'The red channel is clipping independently. Saturated warm highlights (sunsets, fire) often push red to 255 while green and blue are fine, losing color detail in those tones.',
        targetField: 'diagnosis',
        options: [
          { label: 'Red channel clipping — warm highlight detail lost', value: 'red-clip' },
          { label: 'The image is overexposed overall', value: 'overexposed' },
          { label: 'The white balance is wrong', value: 'wb' },
        ],
        correctOption: 'red-clip',
      },
      {
        id: 'hist-intermediate-2',
        difficulty: 'intermediate',
        scenario: 'The tool reports 2.3% black clipping and 0.1% white clipping. Should you adjust your exposure?',
        hint: 'Small amounts of clipping are normal — pure black shadows and specular highlights are expected.',
        successMessage: 'Good judgment! 2.3% black clipping is modest and often just deep shadows or dark edges. 0.1% white clipping is likely specular highlights (sun reflections). This exposure is fine for most purposes.',
        failureMessage: 'These clipping percentages are quite small. A little black clipping in deep shadows and tiny white clipping from specular highlights is normal and expected. No adjustment needed.',
        targetField: 'action',
        options: [
          { label: 'Increase exposure to reduce black clipping', value: 'increase' },
          { label: 'This is fine — small clipping in shadows and specular highlights is normal', value: 'fine' },
          { label: 'Decrease exposure to eliminate white clipping', value: 'decrease' },
        ],
        correctOption: 'fine',
      },
      {
        id: 'hist-advanced-1',
        difficulty: 'advanced',
        scenario: 'You are shooting a high-contrast scene: a bride in a white dress standing in a dark cathedral. The histogram shows strong peaks at both extremes with a gap in the midtones. How should you handle this?',
        hint: 'When the scene dynamic range exceeds the camera sensor range, you need a multi-exposure technique.',
        successMessage: 'Perfect! This bimodal histogram indicates the scene exceeds your sensor dynamic range. Exposure bracketing (HDR) captures both the dark interior and bright dress detail. Alternatively, use fill flash to lift the shadows.',
        failureMessage: 'A bimodal histogram (peaks at both extremes, empty middle) means the scene has more dynamic range than your sensor can capture in one shot. Bracket exposures for HDR, or use fill flash to reduce the contrast ratio.',
        targetField: 'technique',
        options: [
          { label: 'Bracket exposures for HDR or use fill flash', value: 'bracket' },
          { label: 'Expose for the midtones and hope for the best', value: 'midtones' },
          { label: 'Switch to black and white to hide the problem', value: 'bw' },
        ],
        correctOption: 'bracket',
      },
    ],
  },

  // ── Tool 13: Color Harmony Picker ──────────────────────────────────
  {
    slug: 'color-scheme-generator',
    beginner:
      'Color harmony is about choosing colors that look good together. Just like musical chords, certain color combinations create pleasing visual relationships. Photographers use color harmony to plan wardrobe, set design, and even timing of outdoor shoots to get the right palette from nature.',
    deeper:
      'Color harmony theory is rooted in the color wheel, which arranges hues in a circle based on their wavelength relationships. Complementary colors sit opposite each other (e.g., blue and orange, red and green) and create maximum contrast. Analogous colors are neighbors on the wheel and produce smooth, cohesive palettes. Triadic harmony uses three evenly spaced hues for balanced vibrancy. Split-complementary modifies the complementary scheme by using the two neighbors of the opposite color, reducing tension while keeping contrast. Tetradic (double-complementary) uses four colors forming a rectangle on the wheel, offering the richest palette but requiring careful balance. In photography, these relationships appear naturally — golden hour produces analogous warm tones, while a red barn against green fields is complementary. The HSL (Hue, Saturation, Lightness) model maps directly to the wheel: hue is the angle, saturation is the distance from center, and lightness controls the brightness.',
    keyFactors: [
      { label: 'Harmony Type', description: 'The geometric relationship between colors on the wheel: complementary, analogous, triadic, split-complementary, or tetradic.' },
      { label: 'Hue', description: 'The base color angle on the wheel (0-360 degrees). This is the starting point for all harmony calculations.' },
      { label: 'Saturation', description: 'How vivid or muted the colors are. Lower saturation produces pastels and earth tones; higher saturation gives bold, vibrant palettes.' },
      { label: 'Lightness', description: 'Controls brightness. Adjusting lightness can make the same hue feel completely different — dark navy vs. sky blue are the same hue at different lightness.' },
    ],
    tips: [
      { text: 'For portrait sessions, pick a complementary or split-complementary palette, then have your subject wear the key color while the background provides the contrasting hue. Blue/orange (golden hour portraits) is a classic example.' },
      { text: 'Use analogous harmony for landscapes — nature already works in analogous palettes. Match your wardrobe advice or prop choices to the dominant natural hues.' },
      { text: 'Reduce saturation to 30-50% to preview how colors will look in a more muted, editorial style. High saturation works for commercial and fashion, but lower saturation often feels more sophisticated.' },
    ],
    tooltips: {
      'Harmony Type': {
        term: 'Harmony Type',
        definition: 'The color relationship pattern: Complementary (opposite), Analogous (neighbors), Triadic (three-way), Split Complementary (offset opposites), or Tetradic (four-way rectangle).',
      },
      'Key Color': {
        term: 'Key Color',
        definition: 'The dominant color in your palette. All other harmony colors are calculated relative to this starting hue.',
      },
      Hue: {
        term: 'Hue',
        definition: 'The color angle on the wheel in degrees: 0° is red, 120° is green, 240° is blue.',
      },
      Saturation: {
        term: 'Saturation',
        definition: 'Color intensity from 0% (gray) to 100% (fully vivid). Controls how bold or muted the entire palette appears.',
      },
      Lightness: {
        term: 'Lightness',
        definition: 'Brightness from 0% (black) to 100% (white). At 50% you see the pure color; below is darker, above is lighter.',
      },
      'Split Angle': {
        term: 'Split Angle',
        definition: 'How far apart the two split-complementary colors are from the direct opposite. Wider angles give more contrast.',
      },
      Spread: {
        term: 'Spread',
        definition: 'How far apart the analogous colors are from the key hue. Narrow spread gives subtle variation; wide spread increases diversity.',
      },
    },
    challenges: [
      {
        id: 'ch-beginner-1',
        difficulty: 'beginner',
        scenario: 'You want maximum contrast between two colors for a bold graphic portrait. Which harmony type gives you the most visual tension?',
        hint: 'Colors directly across from each other on the wheel create the strongest contrast.',
        successMessage: 'Correct! Complementary colors sit 180 degrees apart and produce the highest contrast — perfect for bold, eye-catching compositions.',
        failureMessage: 'Complementary harmony places colors directly opposite on the wheel, creating maximum visual contrast.',
        targetField: 'harmonyType',
        options: [
          { label: 'Complementary', value: 'complementary' },
          { label: 'Analogous', value: 'analogous' },
          { label: 'Triadic', value: 'triadic' },
        ],
        correctOption: 'complementary',
      },
      {
        id: 'ch-beginner-2',
        difficulty: 'beginner',
        scenario: 'You are planning a golden hour shoot and want warm, cohesive tones. Which harmony type keeps colors close together on the wheel?',
        hint: 'This type uses neighboring hues for a smooth, unified feel.',
        successMessage: 'Right! Analogous harmony uses adjacent colors, giving you a warm, cohesive palette perfect for golden hour.',
        failureMessage: 'Analogous harmony keeps all colors as neighbors on the wheel — ideal for unified warm or cool palettes.',
        targetField: 'harmonyType',
        options: [
          { label: 'Complementary', value: 'complementary' },
          { label: 'Analogous', value: 'analogous' },
          { label: 'Tetradic', value: 'tetradic' },
        ],
        correctOption: 'analogous',
      },
      {
        id: 'ch-intermediate-1',
        difficulty: 'intermediate',
        scenario: 'A client wants a portrait with contrast but not as intense as pure complementary. Which harmony type softens the opposition while keeping visual interest?',
        hint: 'This type uses two colors near the complement instead of the direct opposite.',
        successMessage: 'Excellent! Split complementary keeps the contrast of complementary but splits the opposing color into two flanking hues, producing a less jarring but still dynamic palette.',
        failureMessage: 'Split Complementary is the answer — it replaces the single opposite color with two neighbors of the opposite, softening the contrast while maintaining visual energy.',
        targetField: 'harmonyType',
        options: [
          { label: 'Split Complementary', value: 'split-complementary' },
          { label: 'Triadic', value: 'triadic' },
          { label: 'Analogous', value: 'analogous' },
        ],
        correctOption: 'split-complementary',
      },
      {
        id: 'ch-intermediate-2',
        difficulty: 'intermediate',
        scenario: 'You set the key color to orange (hue ~30 degrees) with complementary harmony. What color will the complement be?',
        hint: 'Complementary means 180 degrees opposite on the wheel.',
        successMessage: 'Correct! 30° + 180° = 210°, which falls in the blue range. Orange and blue is one of photography most beloved complementary pairs.',
        failureMessage: 'Adding 180° to orange (30°) gives 210°, which is blue. The orange-blue complementary pair is a photography staple.',
        targetField: 'complementColor',
        options: [
          { label: 'Blue (~210°)', value: 'blue' },
          { label: 'Green (~150°)', value: 'green' },
          { label: 'Red (~0°)', value: 'red' },
        ],
        correctOption: 'blue',
      },
      {
        id: 'ch-advanced-1',
        difficulty: 'advanced',
        scenario: 'You are art-directing a fashion editorial and need a four-color palette that provides both warm and cool tones with high visual richness. Which harmony type gives you four colors, and what is the main challenge when using it?',
        hint: 'The four-color harmony forms a rectangle on the wheel.',
        successMessage: 'Right! Tetradic harmony gives four colors forming a rectangle on the wheel. The main challenge is balance — with four distinct hues, one should dominate while the others accent. Without hierarchy, the image feels chaotic.',
        failureMessage: 'Tetradic (double-complementary) provides four colors in a rectangular arrangement. The challenge is that four strong hues compete for attention — you need to designate one dominant color and use the others as accents.',
        targetField: 'harmonyType',
        options: [
          { label: 'Tetradic — challenge is maintaining visual hierarchy among four hues', value: 'tetradic' },
          { label: 'Triadic — challenge is having too few colors', value: 'triadic' },
          { label: 'Analogous — challenge is lack of contrast', value: 'analogous' },
        ],
        correctOption: 'tetradic',
      },
    ],
  },

  // ── Tool 14: FOV Simulator ─────────────────────────────────────────
  {
    slug: 'fov-simulator',
    beginner:
      'Field of view (FOV) is how much of a scene your camera captures. A wide-angle lens (like 24mm) sees a broad view, while a telephoto lens (like 200mm) narrows in on a small slice. This simulator lets you compare up to four lenses on different sensors, overlaid on real-world scenes, so you can visualize exactly what each combination captures.',
    deeper:
      'Field of view is determined by two factors: the focal length of the lens and the size of the sensor. The horizontal FOV angle is calculated as 2 × arctan(sensorWidth / (2 × focalLength)). A shorter focal length or larger sensor produces a wider angle of view. When switching sensors, the "equivalent focal length" concept applies: a 50mm lens on an APS-C sensor (1.5x crop) frames the same as a 75mm lens on full frame, because the smaller sensor captures a narrower central portion of the image circle. However, perspective (the spatial relationship between near and far objects) depends only on camera position, not focal length — a 50mm and 200mm lens shot from the same spot show the same perspective, just different crops. This simulator helps you plan lens purchases, understand how focal length affects composition, and compare sensor formats visually.',
    keyFactors: [
      { label: 'Focal Length', description: 'The primary control over field of view. Shorter focal lengths see more of the scene; longer ones see less but magnify distant subjects.' },
      { label: 'Sensor Size', description: 'A smaller sensor crops into the center of the image circle, narrowing the field of view (the crop factor effect).' },
      { label: 'Orientation', description: 'Portrait (vertical) orientation shows a taller, narrower slice. Landscape (horizontal) shows the wider, more traditional view.' },
      { label: 'Scene Context', description: 'Different scenes (cityscapes, interiors, nature) help you understand how FOV changes feel in various real-world contexts.' },
    ],
    tips: [
      { text: 'Add two lenses and toggle between a crop sensor and full frame on one of them to instantly see the crop-factor effect. A 35mm on APS-C frames almost identically to a 50mm on full frame.' },
      { text: 'Use the scene selector to check coverage for specific shooting situations — a cityscape scene shows whether your wide-angle is wide enough to capture a building from across the street.' },
      { text: 'When planning a lens purchase, add your current lens as Lens A and the lens you are considering as Lens B. The overlay shows exactly how much more or less you would see.' },
    ],
    tooltips: {
      'Focal Length': {
        term: 'Focal Length',
        definition: 'The distance (in mm) from the lens optical center to the sensor when focused at infinity. Shorter = wider field of view.',
      },
      Sensor: {
        term: 'Sensor',
        definition: 'The camera sensor format for this lens. Different sensor sizes crop the image circle differently, changing the effective field of view.',
      },
      Scene: {
        term: 'Scene',
        definition: 'The background reference image. Choose a scene that matches the type of photography you are planning to better judge the lens coverage.',
      },
      Orientation: {
        term: 'Orientation',
        definition: 'Toggle between landscape (horizontal) and portrait (vertical) camera orientation. The FOV rectangle rotates accordingly.',
      },
    },
    challenges: [
      {
        id: 'fov-beginner-1',
        difficulty: 'beginner',
        scenario: 'You want to capture a wide view of a city skyline. Which focal length gives a wider field of view?',
        hint: 'Lower focal length numbers mean a wider view.',
        successMessage: 'Correct! A 24mm lens sees much more of the scene than a 70mm. Wide-angle lenses have short focal lengths.',
        failureMessage: 'Shorter focal lengths give wider fields of view. 24mm is a wide-angle lens that captures much more of the skyline than 70mm.',
        targetField: 'focalLength',
        options: [
          { label: '24mm', value: '24' },
          { label: '70mm', value: '70' },
          { label: '200mm', value: '200' },
        ],
        correctOption: '24',
      },
      {
        id: 'fov-beginner-2',
        difficulty: 'beginner',
        scenario: 'Set up Lens A as a 50mm on Full Frame. What type of field of view does this "nifty fifty" give?',
        hint: 'The 50mm on full frame is called a "normal" lens because it approximates human vision.',
        successMessage: 'Right! A 50mm on full frame is the classic "normal" lens — its ~46-degree field of view approximates what the human eye naturally focuses on.',
        failureMessage: 'A 50mm on full frame is considered a "normal" lens because its field of view (~46 degrees) closely matches comfortable human perception.',
        targetField: 'fovType',
        options: [
          { label: 'Ultra-wide angle', value: 'ultrawide' },
          { label: 'Normal / standard', value: 'normal' },
          { label: 'Telephoto', value: 'telephoto' },
        ],
        correctOption: 'normal',
      },
      {
        id: 'fov-intermediate-1',
        difficulty: 'intermediate',
        scenario: 'Add two lenses: Lens A is 35mm on APS-C (Nikon/Sony), and Lens B is 50mm on Full Frame. Compare the two FOV overlays. What do you notice?',
        hint: '35mm multiplied by the APS-C crop factor of 1.5 equals...',
        successMessage: 'Exactly! 35mm on APS-C (1.5x crop) gives an equivalent field of view to 52.5mm on full frame — nearly identical to 50mm FF. The overlays are almost the same size.',
        failureMessage: '35mm x 1.5 crop factor = 52.5mm equivalent. This is nearly identical to 50mm on full frame, which is why the overlays are almost the same.',
        targetField: 'observation',
        options: [
          { label: 'They have nearly identical fields of view', value: 'same' },
          { label: 'The APS-C lens shows a much wider view', value: 'wider' },
          { label: 'The Full Frame lens shows a much wider view', value: 'narrower' },
        ],
        correctOption: 'same',
      },
      {
        id: 'fov-intermediate-2',
        difficulty: 'intermediate',
        scenario: 'You are shooting a small room interior. You have a 24mm lens. Will you see more of the room on Full Frame or APS-C?',
        hint: 'A smaller sensor captures a narrower central portion of the lens image circle.',
        successMessage: 'Correct! Full Frame sees more because the larger sensor captures a wider portion of the 24mm lens image circle. On APS-C, the same 24mm lens frames like ~36mm.',
        failureMessage: 'Full Frame captures more of the scene. The larger sensor uses more of the lens image circle, giving a wider effective field of view.',
        targetField: 'sensor',
        options: [
          { label: 'Full Frame — larger sensor sees more', value: 'ff' },
          { label: 'APS-C — crop sensor sees more', value: 'apsc' },
          { label: 'Both see the same — focal length is what matters', value: 'same' },
        ],
        correctOption: 'ff',
      },
      {
        id: 'fov-advanced-1',
        difficulty: 'advanced',
        scenario: 'A wildlife photographer shoots with a 200mm lens on Micro Four Thirds. What full-frame equivalent focal length does this produce, and what is the trade-off compared to actually using a 400mm lens on full frame?',
        hint: 'M43 has a 2x crop factor. Think about depth of field and sensor size differences.',
        successMessage: 'Excellent! 200mm on M43 (2x crop) gives a 400mm-equivalent field of view. The trade-off: while the framing matches a 400mm FF, the depth of field matches the 200mm lens (deeper DoF), and the smaller sensor gathers less total light, meaning worse noise performance at high ISO. The advantage is a much smaller, lighter, and cheaper lens.',
        failureMessage: '200mm x 2.0 crop = 400mm equivalent FOV. But it is not identical to a 400mm on FF: you get more depth of field (based on the actual 200mm FL), less light gathering (smaller sensor), and more noise at high ISO. The benefit is significantly smaller and lighter gear.',
        targetField: 'analysis',
        options: [
          { label: '400mm equivalent — same FOV but deeper DoF, more noise, smaller/lighter gear', value: 'correct' },
          { label: '400mm equivalent — identical in every way to 400mm on full frame', value: 'identical' },
          { label: '200mm equivalent — crop factor does not affect FOV', value: 'no-effect' },
        ],
        correctOption: 'correct',
      },
    ],
  },
]
