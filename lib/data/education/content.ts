import type { ToolEducation } from './types'

export const TOOL_EDUCATION: ToolEducation[] = [
  // ── Tool 1: dof-calculator ──────────────────────────────────────────
  {
    slug: 'dof-calculator',
    beginner:
      'Depth of field (DoF) is the range of distance in your photo that appears acceptably sharp. A shallow DoF blurs the background behind your subject, while a deep DoF keeps everything from foreground to horizon in focus. Controlling DoF is one of the most powerful creative tools in photography.',
    deeper:
      'Depth of field is governed by the circle of confusion (CoC) — the largest blur spot on the sensor that still looks sharp to the human eye. Three physical factors determine DoF: focal length, aperture, and subject distance. A wider aperture (lower f-number) produces a shallower DoF because the lens converges light at steeper angles, causing out-of-focus points to spread into larger circles on the sensor. Longer focal lengths magnify the image, which also magnifies the blur circles, narrowing the DoF. Moving closer to your subject reduces DoF for the same reason — the relative difference in distance between the subject and background becomes greater. The hyperfocal distance is the focus distance at which DoF extends from half that distance to infinity, maximizing sharpness across the entire scene.',
    keyFactors: [
      {
        label: 'Aperture',
        description:
          'Wider apertures (f/1.4-f/2.8) create shallow DoF with creamy bokeh. Narrower apertures (f/8-f/16) increase sharpness throughout the scene.',
      },
      {
        label: 'Focal Length',
        description:
          'Longer lenses compress perspective and narrow DoF at the same aperture and framing. A 200mm lens at f/4 has far less DoF than a 35mm lens at f/4.',
      },
      {
        label: 'Subject Distance',
        description:
          'The closer you focus, the shallower the DoF. Macro photographers often work with DoF measured in millimeters.',
      },
      {
        label: 'Sensor Size',
        description:
          'Larger sensors require longer focal lengths for the same framing, which indirectly narrows DoF. A full-frame camera produces shallower DoF than a Micro Four Thirds camera at equivalent framing.',
      },
    ],
    tips: [
      {
        text: 'For group portraits, use f/5.6 or narrower and have everyone stand in the same focal plane. Even one person half a step forward can fall out of focus at wide apertures.',
      },
      {
        text: 'When shooting landscapes, focus at the hyperfocal distance rather than at infinity. This maximizes the zone of sharpness from the near foreground to the far background.',
      },
      {
        text: 'If you want maximum background blur for a portrait, increase your focal length and get as close to your subject as framing allows — both changes stack to reduce DoF dramatically.',
      },
    ],
    tooltips: {
      focalLength: {
        term: 'Focal Length',
        definition:
          'The distance in millimeters from the optical center of the lens to the sensor when focused at infinity. Longer focal lengths magnify the image and narrow the depth of field.',
      },
      aperture: {
        term: 'Aperture',
        definition:
          'The size of the lens opening, expressed as an f-number (e.g., f/2.8). Lower f-numbers mean a wider opening, letting in more light and producing shallower depth of field.',
      },
      subjectDistance: {
        term: 'Subject Distance',
        definition:
          'The distance from the camera sensor to the point of focus. Closer focus distances result in shallower depth of field.',
      },
      sensor: {
        term: 'Sensor Size',
        definition:
          'The physical dimensions of the camera sensor. Larger sensors (full-frame, medium format) produce shallower depth of field at equivalent framing compared to smaller sensors (APS-C, Micro Four Thirds).',
      },
      nearFocus: {
        term: 'Near Focus Limit',
        definition:
          'The closest distance from the camera that appears acceptably sharp. Everything closer than this will appear blurred.',
      },
      farFocus: {
        term: 'Far Focus Limit',
        definition:
          'The farthest distance from the camera that appears acceptably sharp. When this reaches infinity, everything beyond the near limit is in focus.',
      },
      totalDoF: {
        term: 'Total Depth of Field',
        definition:
          'The full distance between the near and far focus limits — the entire zone that appears sharp in the image.',
      },
      hyperfocal: {
        term: 'Hyperfocal Distance',
        definition:
          'The focus distance that maximizes depth of field. When you focus at this distance, everything from half the hyperfocal distance to infinity appears sharp.',
      },
    },
    challenges: [
      {
        id: 'dof-portrait-blur',
        difficulty: 'beginner',
        scenario:
          'You are shooting a portrait and want a beautifully blurred background. Which aperture should you choose?',
        hint: 'Lower f-numbers mean a wider lens opening and more background blur.',
        successMessage:
          'Correct! A wide aperture like f/1.8 or f/2.8 creates a shallow depth of field, separating your subject from the background with pleasing bokeh.',
        failureMessage:
          'Not quite. Narrow apertures like f/11 or f/16 keep more of the scene in focus. For background blur, choose a wide aperture (low f-number).',
        targetField: 'aperture',
        options: [
          { label: 'f/1.8', value: 'f/1.8' },
          { label: 'f/5.6', value: 'f/5.6' },
          { label: 'f/11', value: 'f/11' },
          { label: 'f/16', value: 'f/16' },
        ],
        correctOption: 'f/1.8',
      },
      {
        id: 'dof-group-photo',
        difficulty: 'beginner',
        scenario:
          'You are photographing a group of 8 people arranged in two rows at a wedding. What aperture will help ensure everyone is in focus?',
        hint: 'With people at slightly different distances, you need enough depth of field to cover both rows.',
        successMessage:
          'Great choice! f/5.6 provides enough depth of field to keep both rows sharp while still maintaining decent shutter speeds indoors.',
        failureMessage:
          'That aperture may leave the back row out of focus or be unnecessarily narrow. For two rows of people, f/5.6 is a reliable starting point.',
        targetField: 'aperture',
        options: [
          { label: 'f/1.4', value: 'f/1.4' },
          { label: 'f/2.8', value: 'f/2.8' },
          { label: 'f/5.6', value: 'f/5.6' },
          { label: 'f/22', value: 'f/22' },
        ],
        correctOption: 'f/5.6',
      },
      {
        id: 'dof-landscape-sharp',
        difficulty: 'intermediate',
        scenario:
          'You are shooting a landscape with wildflowers 2 meters away and mountains in the background. You are using a 24mm lens on a full-frame camera. What technique will maximize sharpness from front to back?',
        hint: 'There is a specific distance you can focus at that maximizes the sharp zone from foreground to infinity.',
        successMessage:
          'Exactly! Focusing at the hyperfocal distance at f/11 ensures everything from about 1 meter to infinity is acceptably sharp — perfect for this scene.',
        failureMessage:
          'Focusing at infinity would leave the foreground flowers soft. Use the hyperfocal distance to extend sharpness from the near foreground through to infinity.',
        targetField: 'subjectDistance',
        options: [
          { label: 'Focus on the flowers (2m)', value: 'flowers' },
          { label: 'Focus on the mountains (infinity)', value: 'infinity' },
          { label: 'Focus at the hyperfocal distance', value: 'hyperfocal' },
          { label: 'Focus halfway between flowers and mountains', value: 'halfway' },
        ],
        correctOption: 'hyperfocal',
      },
      {
        id: 'dof-macro-challenge',
        difficulty: 'intermediate',
        scenario:
          'You are doing macro photography of a flower and notice only the front petals are sharp. The rest of the flower fades to blur. You are at f/5.6. What should you do to get more of the flower in focus?',
        hint: 'At close focus distances, DoF becomes extremely thin. Consider your aperture.',
        successMessage:
          'Right! Stopping down to f/11 or f/16 increases your razor-thin DoF in macro work. Just watch out for diffraction softening at very small apertures.',
        failureMessage:
          'Opening the aperture wider would make DoF even thinner. In macro photography, stopping down (higher f-number) is the primary way to gain more depth.',
        targetField: 'aperture',
        options: [
          { label: 'Open to f/2.8 for more light', value: 'f/2.8' },
          { label: 'Stop down to f/11', value: 'f/11' },
          { label: 'Switch to a wider lens', value: 'wider-lens' },
          { label: 'Move farther from the flower', value: 'move-back' },
        ],
        correctOption: 'f/11',
      },
      {
        id: 'dof-sensor-comparison',
        difficulty: 'advanced',
        scenario:
          'You are comparing two cameras for portrait work: a full-frame camera with an 85mm f/1.8 lens and a Micro Four Thirds camera with a 42.5mm f/1.8 lens. Both produce equivalent framing. Which camera produces shallower depth of field?',
        hint: 'Think about equivalent focal lengths and how sensor size affects the DoF calculation at the same f-number.',
        successMessage:
          'Correct! The full-frame camera produces roughly 2 stops shallower DoF. While the MFT lens has the same f-number, the shorter actual focal length (42.5mm vs 85mm) results in deeper depth of field at equivalent framing.',
        failureMessage:
          'Although both lenses are f/1.8, the full-frame camera uses a longer actual focal length for the same framing, producing significantly shallower DoF.',
        targetField: 'sensor',
        options: [
          { label: 'Full-frame with 85mm f/1.8', value: 'full-frame' },
          { label: 'Micro Four Thirds with 42.5mm f/1.8', value: 'mft' },
          { label: 'Both produce identical DoF', value: 'same' },
        ],
        correctOption: 'full-frame',
      },
    ],
  },

  // ── Tool 2: exposure-simulator ──────────────────────────────────────
  {
    slug: 'exposure-simulator',
    beginner:
      'The exposure triangle describes how three camera settings — aperture, shutter speed, and ISO — work together to control how bright your photo is. Changing one setting requires adjusting at least one of the others to maintain the same brightness. Each setting also has its own creative side effect: aperture controls background blur, shutter speed controls motion blur, and ISO controls image noise.',
    deeper:
      'Exposure is measured in Exposure Value (EV), where each whole EV step represents a doubling or halving of light. An increase of 1 EV (one "stop") means twice as much light is reaching the sensor. Aperture follows a geometric progression (f/1.4, f/2, f/2.8, f/4...) where each full stop halves the light entering the lens because the area of the opening is inversely proportional to the square of the f-number. Shutter speed is more intuitive: doubling the time doubles the light. ISO amplifies the signal from the sensor — doubling the ISO doubles the effective brightness but also amplifies noise. In practice, you typically set the parameter that matters most for your creative intent first (aperture for DoF control, shutter for motion), then balance the others. Modern cameras meter in 1/3-stop increments for finer control.',
    keyFactors: [
      {
        label: 'Aperture',
        description:
          'Controls the size of the lens opening. Each full stop (e.g., f/2.8 to f/4) halves the light. Also affects depth of field — wider apertures blur the background more.',
      },
      {
        label: 'Shutter Speed',
        description:
          'Controls how long the sensor is exposed to light. Faster speeds freeze motion; slower speeds introduce motion blur. Doubling the time doubles the light.',
      },
      {
        label: 'ISO',
        description:
          'Controls the sensor\'s sensitivity to light. Higher ISO brightens the image but adds grain/noise. Always use the lowest ISO that gives you the exposure you need.',
      },
      {
        label: 'Exposure Value (EV)',
        description:
          'A single number that represents the overall brightness. EV 0 corresponds to a 1-second exposure at f/1.0. Each +1 EV halves the light.',
      },
    ],
    tips: [
      {
        text: 'Start with Aperture Priority mode: set the aperture for your desired depth of field, and let the camera choose the shutter speed. Only raise ISO when the shutter speed drops too low for sharp handheld shots.',
      },
      {
        text: 'For sports and action, switch to Shutter Priority: pick a fast shutter speed (1/500s or faster) and let the camera adjust aperture and ISO to match.',
      },
      {
        text: 'The "Sunny 16" rule is a quick mental shortcut: on a bright sunny day, set aperture to f/16, shutter speed to 1/ISO (e.g., 1/100s at ISO 100), and you will get a well-exposed image without metering.',
      },
    ],
    tooltips: {
      aperture: {
        term: 'Aperture',
        definition:
          'The lens opening size expressed as an f-number. Lower numbers (f/1.4) let in more light and blur the background. Higher numbers (f/16) let in less light but keep more of the scene sharp.',
      },
      shutterSpeed: {
        term: 'Shutter Speed',
        definition:
          'The duration the sensor is exposed to light, typically measured in fractions of a second (1/250s) or full seconds (2s). Faster speeds freeze motion; slower speeds create motion blur.',
      },
      iso: {
        term: 'ISO',
        definition:
          'A measure of sensor sensitivity. ISO 100 is the base (cleanest image). Each doubling (200, 400, 800...) brightens the image by one stop but progressively adds noise.',
      },
      ev: {
        term: 'Exposure Value (EV)',
        definition:
          'A single number summarizing the overall exposure. Higher EV means brighter conditions or more light captured. Each +1 EV is double the light.',
      },
    },
    challenges: [
      {
        id: 'exp-freeze-action',
        difficulty: 'beginner',
        scenario:
          'You are photographing your dog running in the park on a sunny day. The image keeps coming out blurry. Which setting should you prioritize to freeze the motion?',
        hint: 'Motion blur is caused by the subject moving during the exposure.',
        successMessage:
          'Correct! A fast shutter speed like 1/1000s will freeze your dog mid-stride. On a sunny day, you have plenty of light to support this.',
        failureMessage:
          'That setting won\'t directly freeze motion. To stop a moving subject, you need a fast shutter speed — the shorter the exposure, the less time the subject has to blur.',
        targetField: 'shutterSpeed',
        options: [
          { label: 'Widen the aperture to f/2.8', value: 'aperture' },
          { label: 'Use a fast shutter speed (1/1000s)', value: 'shutter' },
          { label: 'Increase ISO to 3200', value: 'iso' },
          { label: 'Use a longer focal length', value: 'focal' },
        ],
        correctOption: 'shutter',
      },
      {
        id: 'exp-low-light',
        difficulty: 'beginner',
        scenario:
          'You are taking photos at an indoor birthday party. Your images are too dark at f/3.5, 1/60s, ISO 400. You cannot use a flash. What is the best next step?',
        hint: 'You need more light reaching the sensor or more amplification of the signal.',
        successMessage:
          'Good thinking! Raising ISO to 1600 gives you two extra stops of brightness while keeping your shutter speed fast enough for handheld shots.',
        failureMessage:
          'That change might cause other issues. Since the aperture is already near its widest and you need a shutter speed fast enough for handheld use, raising ISO is the most practical adjustment.',
        targetField: 'iso',
        options: [
          { label: 'Raise ISO to 1600', value: 'iso-1600' },
          { label: 'Slow shutter to 1/4s', value: 'slow-shutter' },
          { label: 'Close aperture to f/8', value: 'close-aperture' },
          { label: 'Switch to a smaller sensor camera', value: 'smaller-sensor' },
        ],
        correctOption: 'iso-1600',
      },
      {
        id: 'exp-waterfall-silk',
        difficulty: 'intermediate',
        scenario:
          'You want to capture a waterfall with a silky smooth water effect on a bright day. Your current settings are f/8, 1/250s, ISO 100. What should you change to get the silky look?',
        hint: 'Silky water requires a long exposure, but it is very bright outside.',
        successMessage:
          'Exactly! Using a slow shutter speed (1/2s or longer) and compensating by narrowing the aperture to f/22 (and possibly adding an ND filter) will give you that silky water effect.',
        failureMessage:
          'To get silky water, you need a slow shutter speed — around 1/2s to several seconds. On a bright day, you will also need to reduce the light entering the lens to avoid overexposure.',
        targetField: 'shutterSpeed',
        options: [
          { label: 'Use 1/2s shutter and narrow to f/22', value: 'slow-narrow' },
          { label: 'Use 1/1000s shutter at f/2.8', value: 'fast-wide' },
          { label: 'Raise ISO to 6400', value: 'high-iso' },
          { label: 'Keep 1/250s but open to f/1.4', value: 'same-speed' },
        ],
        correctOption: 'slow-narrow',
      },
      {
        id: 'exp-stop-equivalence',
        difficulty: 'intermediate',
        scenario:
          'Your properly exposed photo is at f/5.6, 1/125s, ISO 200. You want to switch to f/2.8 for more background blur. How should you adjust the other settings to maintain the same exposure?',
        hint: 'Going from f/5.6 to f/2.8 is 2 stops more light. You need to remove 2 stops somewhere else.',
        successMessage:
          'Perfect! Opening from f/5.6 to f/2.8 adds 2 stops of light. Changing shutter speed from 1/125s to 1/500s removes exactly 2 stops, keeping the exposure identical.',
        failureMessage:
          'The math needs to balance. f/5.6 to f/2.8 is +2 stops. You need to compensate by removing exactly 2 stops through faster shutter speed, lower ISO, or a combination.',
        targetField: 'shutterSpeed',
        options: [
          { label: '1/500s at ISO 200', value: '1/500' },
          { label: '1/250s at ISO 200', value: '1/250' },
          { label: '1/125s at ISO 100', value: '1/125-iso100' },
          { label: '1/60s at ISO 100', value: '1/60-iso100' },
        ],
        correctOption: '1/500',
      },
      {
        id: 'exp-concert-challenge',
        difficulty: 'advanced',
        scenario:
          'You are photographing a concert in a dark venue. The performers are moving quickly under colored stage lights. You need at least 1/250s to freeze motion. Your fastest lens is f/2.8. What ISO do you likely need if the scene meters at EV 4?',
        hint: 'At EV 4, f/2.8, calculate the ISO needed to achieve 1/250s. Each full stop of ISO doubles the brightness.',
        successMessage:
          'Correct! At EV 4 with f/2.8 and 1/250s, you need ISO 3200. Concert photography often demands high ISO — knowing your camera\'s usable ISO limit is critical for these situations.',
        failureMessage:
          'At EV 4, the combination of f/2.8 and 1/250s requires ISO 3200 to achieve proper exposure. Use the EV formula: EV = log2(N^2 / t) - log2(ISO / 100).',
        targetField: 'iso',
        options: [
          { label: 'ISO 400', value: '400' },
          { label: 'ISO 800', value: '800' },
          { label: 'ISO 3200', value: '3200' },
          { label: 'ISO 12800', value: '12800' },
        ],
        correctOption: '3200',
      },
    ],
  },

  // ── Tool 3: diffraction-limit ───────────────────────────────────────
  {
    slug: 'diffraction-limit',
    beginner:
      'Every lens has a "sweet spot" aperture where images are sharpest. If you close the aperture too far (high f-numbers like f/16 or f/22), light bends around the aperture blades in a phenomenon called diffraction, which softens the image. The diffraction limit tells you the smallest aperture you can use before this softening becomes visible.',
    deeper:
      'Diffraction is a fundamental wave-optics effect: when light passes through a small opening, it spreads out, forming an Airy disk pattern on the sensor. The Airy disk diameter is approximately 2.44 times the wavelength of light times the f-number (d = 2.44 * lambda * N). When the Airy disk becomes larger than the pixel pitch of the sensor, diffraction softening exceeds the sensor\'s ability to resolve detail, and you have reached the diffraction limit. Higher-resolution sensors with smaller pixels hit this limit at wider apertures. For example, a 50MP full-frame sensor with ~3.3 micrometer pixel pitch shows diffraction softening around f/8, while a 12MP sensor with ~7 micrometer pixels can be stopped down to f/16 without visible loss. This does not mean you should never exceed the limit — the extra depth of field gained may outweigh the slight softening.',
    keyFactors: [
      {
        label: 'Pixel Pitch',
        description:
          'The physical size of each pixel on the sensor. Smaller pixels (higher megapixel count for a given sensor size) hit the diffraction limit at wider apertures.',
      },
      {
        label: 'Aperture',
        description:
          'Narrower apertures produce larger Airy disks. Past a certain f-number, the Airy disk exceeds the pixel size and detail is lost to diffraction.',
      },
      {
        label: 'Sensor Resolution',
        description:
          'Higher megapixel sensors demand more from optics. A 100MP sensor is diffraction-limited at a wider aperture than a 24MP sensor of the same size.',
      },
      {
        label: 'Wavelength of Light',
        description:
          'Green light (~550nm) is the standard reference. Shorter wavelengths (blue) diffract less; longer wavelengths (red) diffract more.',
      },
    ],
    tips: [
      {
        text: 'Most lenses reach peak sharpness 2-3 stops down from wide open. For a lens with a maximum aperture of f/2.8, the sweet spot is typically around f/5.6 to f/8.',
      },
      {
        text: 'If you need both maximum sharpness and great depth of field, consider focus stacking — take multiple shots focused at different distances and merge them in post-processing, rather than stopping down past the diffraction limit.',
      },
      {
        text: 'Do not be afraid to shoot past the diffraction limit when depth of field is more important than pixel-level sharpness. The softening is subtle and often invisible in normal viewing sizes.',
      },
    ],
    tooltips: {
      sensor: {
        term: 'Sensor Size',
        definition:
          'The physical dimensions of the image sensor. Combined with resolution, this determines pixel pitch, which directly affects where the diffraction limit falls.',
      },
      resolution: {
        term: 'Resolution (Megapixels)',
        definition:
          'The total number of pixels on the sensor in millions. Higher resolution means smaller pixels for a given sensor size, making the camera more susceptible to diffraction softening.',
      },
      aperture: {
        term: 'Aperture',
        definition:
          'The lens opening size. As you stop down (increase the f-number), the Airy disk grows larger. Past the diffraction limit, the Airy disk exceeds pixel size.',
      },
      pixelPitch: {
        term: 'Pixel Pitch',
        definition:
          'The center-to-center distance between adjacent pixels, measured in micrometers. Calculated from sensor dimensions and resolution. Smaller pixel pitch means higher density but earlier onset of diffraction effects.',
      },
      diffractionLimit: {
        term: 'Diffraction Limit',
        definition:
          'The aperture beyond which the Airy disk diameter exceeds the pixel pitch, causing visible softening. Expressed as an f-number.',
      },
      airyDisk: {
        term: 'Airy Disk',
        definition:
          'The diffraction pattern created when light passes through a circular aperture. Its diameter determines the smallest point of light the lens can produce at a given f-number.',
      },
      sharpnessAssessment: {
        term: 'Sharpness Assessment',
        definition:
          'An evaluation of whether your chosen aperture is below, at, or beyond the diffraction limit for your specific sensor, indicating the expected impact on image sharpness.',
      },
    },
    challenges: [
      {
        id: 'diff-sweet-spot',
        difficulty: 'beginner',
        scenario:
          'You have a 24MP full-frame camera and want the sharpest possible image of a building facade. Your lens goes from f/2.8 to f/22. Which aperture is likely the sharpest?',
        hint: 'Most lenses are sharpest 2-3 stops from wide open, and a 24MP full-frame sensor has relatively large pixels.',
        successMessage:
          'Spot on! f/8 is typically the sweet spot for a 24MP full-frame sensor — sharp enough to avoid diffraction while the lens aberrations are well controlled.',
        failureMessage:
          'For a 24MP full-frame camera, f/8 offers the best balance between lens aberration correction and avoiding diffraction. At f/2.8 the lens is less sharp optically, while at f/16 diffraction starts to soften the image.',
        targetField: 'aperture',
        options: [
          { label: 'f/2.8', value: 'f/2.8' },
          { label: 'f/8', value: 'f/8' },
          { label: 'f/16', value: 'f/16' },
          { label: 'f/22', value: 'f/22' },
        ],
        correctOption: 'f/8',
      },
      {
        id: 'diff-high-mp',
        difficulty: 'intermediate',
        scenario:
          'You just upgraded from a 24MP to a 61MP full-frame camera. You used to shoot architecture at f/11 with great results. Should you change your approach?',
        hint: 'More megapixels means smaller pixels, which changes where diffraction softening becomes visible.',
        successMessage:
          'Correct! With 61MP, the pixel pitch drops to about 3.7 micrometers, and the diffraction limit is around f/8. You should use f/8 or wider, or accept slight softening at f/11.',
        failureMessage:
          'With much smaller pixels, the diffraction limit shifts to a wider aperture. What was perfectly fine at 24MP may already be showing softening at 61MP. You should reconsider.',
        targetField: 'aperture',
        options: [
          { label: 'Keep shooting at f/11 — megapixels do not matter', value: 'keep-f11' },
          { label: 'Switch to f/8 or wider to stay within the new diffraction limit', value: 'use-f8' },
          { label: 'Stop down more to f/16 for extra sharpness', value: 'use-f16' },
          { label: 'Always shoot wide open at f/2.8', value: 'use-f2.8' },
        ],
        correctOption: 'use-f8',
      },
      {
        id: 'diff-landscape-tradeoff',
        difficulty: 'intermediate',
        scenario:
          'You are shooting a landscape on a 45MP full-frame camera and need maximum depth of field. The scene has elements from 1 meter to infinity. Your options are: shoot at f/16 (some diffraction softening but huge DoF) or shoot at f/8 (peak sharpness but limited DoF) and focus-stack. Which approach is best for ultimate image quality?',
        hint: 'Consider what technique preserves both maximum resolution and maximum depth of field.',
        successMessage:
          'Right! Focus stacking at f/8 gives you the sharpest pixels AND full depth of field. It requires more effort but produces the best results when pixel-level quality matters.',
        failureMessage:
          'While f/16 is simpler, focus stacking at f/8 avoids diffraction entirely while still covering the full depth. For maximum quality on a high-resolution sensor, stacking is superior.',
        targetField: 'aperture',
        options: [
          { label: 'Shoot at f/16 — the softening is negligible', value: 'f16-single' },
          { label: 'Focus-stack at f/8 for maximum sharpness and DoF', value: 'f8-stack' },
          { label: 'Shoot at f/22 for the most DoF possible', value: 'f22-single' },
        ],
        correctOption: 'f8-stack',
      },
      {
        id: 'diff-pixel-pitch-calc',
        difficulty: 'advanced',
        scenario:
          'You have an APS-C camera (23.5mm x 15.6mm sensor) with 26MP resolution. At what approximate f-number does diffraction start to visibly soften your images? Assume 550nm wavelength.',
        hint: 'First calculate pixel pitch from the sensor width and horizontal pixel count, then find where the Airy disk diameter equals the pixel pitch.',
        successMessage:
          'Correct! With a pixel pitch of about 3.9 micrometers, the diffraction limit falls near f/5.6. The Airy disk matches the pixel pitch at approximately f = pixel_pitch / (2.44 * 0.00055mm) = ~2.9, but accounting for Bayer demosaicing, visible softening begins around f/5.6.',
        failureMessage:
          'The pixel pitch for this sensor is about 3.9 micrometers. Using the Airy disk formula and accounting for Bayer demosaicing, diffraction becomes visible around f/5.6 to f/6.3.',
        targetField: 'aperture',
        options: [
          { label: 'f/4', value: 'f/4' },
          { label: 'f/5.6', value: 'f/5.6' },
          { label: 'f/8', value: 'f/8' },
          { label: 'f/11', value: 'f/11' },
        ],
        correctOption: 'f/5.6',
      },
    ],
  },

  // ── Tool 4: star-trail-calculator ───────────────────────────────────
  {
    slug: 'star-trail-calculator',
    beginner:
      'Stars appear to move across the sky because the Earth rotates. If your shutter is open long enough, stars will streak into trails in your photo. The star trail calculator helps you find the maximum exposure time for pinpoint stars, or plan long exposures to create beautiful circular star trail arcs.',
    deeper:
      'The Earth rotates 360 degrees in approximately 23 hours and 56 minutes (a sidereal day), which means stars move at about 15 arcseconds per second at the celestial equator. Stars near the celestial poles (Polaris in the north) trace smaller circles and appear to move more slowly. The classic "500 Rule" divides 500 by your effective focal length to estimate the maximum exposure in seconds before trailing is visible. However, this rule was designed for lower-resolution sensors. The more accurate NPF Rule accounts for pixel pitch, focal length, aperture, and declination: it typically produces shorter — and more accurate — exposure limits for modern high-resolution cameras. For intentional star trails, photographers shoot many shorter exposures (typically 30s each) and stack them in software. This avoids noise buildup, allows for gap-free trails, and means a single bad frame does not ruin the entire shot.',
    keyFactors: [
      {
        label: 'Focal Length',
        description:
          'Longer focal lengths magnify star movement, requiring shorter exposures for pinpoint stars. A 14mm lens can expose 5-10 times longer than a 200mm lens.',
      },
      {
        label: 'Sensor Resolution',
        description:
          'Higher-resolution sensors reveal star trailing at shorter exposure times. The 500 Rule is too generous for modern 40MP+ cameras.',
      },
      {
        label: 'Latitude & Declination',
        description:
          'Stars near the celestial poles move less per second. Pointing toward Polaris allows longer exposures before trails appear.',
      },
      {
        label: 'Stacking vs Single Exposure',
        description:
          'For star trails, stacking many short exposures produces cleaner results than one extremely long exposure, and allows recovery from interruptions.',
      },
    ],
    tips: [
      {
        text: 'Use the NPF Rule instead of the 500 Rule for modern cameras. It accounts for sensor resolution and produces more accurate maximum exposure times, especially with high-megapixel bodies.',
      },
      {
        text: 'For star trail stacking, keep gaps between frames under 2-3 seconds using a wired remote or intervalometer. Longer gaps create dotted rather than smooth trails.',
      },
      {
        text: 'Include Polaris (or the South Celestial Pole) in your composition for dramatic concentric circle trails. Stars closer to the pole trace tighter arcs.',
      },
    ],
    tooltips: {
      mode: {
        term: 'Mode',
        definition:
          'Choose "Sharp Stars" to calculate maximum exposure time for pinpoint stars, or "Star Trails" to plan exposure sequences for intentional trail effects.',
      },
      focalLength: {
        term: 'Focal Length',
        definition:
          'The lens focal length in millimeters. Longer focal lengths magnify apparent star movement, requiring shorter individual exposures.',
      },
      sensor: {
        term: 'Sensor Size',
        definition:
          'The physical sensor dimensions. Combined with resolution, determines pixel pitch, which affects how quickly star trailing becomes visible.',
      },
      resolution: {
        term: 'Resolution',
        definition:
          'The sensor resolution in megapixels. Higher resolution cameras reveal star trailing sooner because each pixel covers a smaller angular area of sky.',
      },
      aperture: {
        term: 'Aperture',
        definition:
          'The lens opening. For astrophotography, use the widest aperture available (lowest f-number) to capture the most starlight in each frame.',
      },
      latitude: {
        term: 'Latitude',
        definition:
          'Your geographic latitude. Affects the apparent motion rate of stars — at higher latitudes, stars near the pole move more slowly across the frame.',
      },
      exposurePerFrame: {
        term: 'Exposure Per Frame',
        definition:
          'The shutter speed for each individual frame in a star trail sequence. Typically 15-30 seconds to capture enough light while avoiding excess noise.',
      },
      numberOfFrames: {
        term: 'Number of Frames',
        definition:
          'How many individual exposures to take. More frames mean longer, more dramatic star trails. 120 frames at 30 seconds each produces one hour of trails.',
      },
      gapBetweenFrames: {
        term: 'Gap Between Frames',
        definition:
          'The time between exposures for the camera to save the file. Keep this as short as possible (1-3 seconds) to avoid dotted trails.',
      },
    },
    challenges: [
      {
        id: 'star-milky-way',
        difficulty: 'beginner',
        scenario:
          'You are photographing the Milky Way with a 24mm lens on a full-frame 24MP camera. Using the 500 Rule, approximately how long can you expose before stars begin to trail?',
        hint: 'The 500 Rule: maximum seconds = 500 / focal length.',
        successMessage:
          'Right! 500 / 24 = approximately 20 seconds. This is a good starting point, though the NPF Rule might suggest a slightly shorter time for critical sharpness.',
        failureMessage:
          'Apply the 500 Rule: divide 500 by your focal length (24mm). That gives you approximately 20 seconds.',
        targetField: 'focalLength',
        options: [
          { label: '5 seconds', value: '5' },
          { label: '10 seconds', value: '10' },
          { label: '20 seconds', value: '20' },
          { label: '60 seconds', value: '60' },
        ],
        correctOption: '20',
      },
      {
        id: 'star-telephoto',
        difficulty: 'beginner',
        scenario:
          'You want to photograph the Orion Nebula with a 200mm lens on a crop-sensor camera (1.5x crop factor). What is the approximate max exposure using the 500 Rule?',
        hint: 'With a crop sensor, multiply the focal length by the crop factor first, then apply the rule.',
        successMessage:
          'Correct! The effective focal length is 200mm x 1.5 = 300mm. 500 / 300 = ~1.7 seconds. At telephoto lengths on crop sensors, you have very little time before trailing appears.',
        failureMessage:
          'Remember to account for the crop factor: 200mm x 1.5 = 300mm effective. Then 500 / 300 gives about 1.7 seconds.',
        targetField: 'focalLength',
        options: [
          { label: '~1.7 seconds', value: '1.7' },
          { label: '~2.5 seconds', value: '2.5' },
          { label: '~5 seconds', value: '5' },
          { label: '~10 seconds', value: '10' },
        ],
        correctOption: '1.7',
      },
      {
        id: 'star-trail-plan',
        difficulty: 'intermediate',
        scenario:
          'You want to create a 2-hour star trail photo. You plan to shoot 30-second exposures with 2-second gaps. How many frames will you need?',
        hint: 'Calculate how many 32-second intervals (30s exposure + 2s gap) fit into 2 hours (7200 seconds).',
        successMessage:
          'Correct! 7200 seconds / 32 seconds per frame = 225 frames. You will get smooth, continuous trails across 2 hours of Earth rotation.',
        failureMessage:
          'Two hours = 7200 seconds. Each frame cycle is 30s + 2s = 32s. Divide 7200 by 32 to get the number of frames needed.',
        targetField: 'numberOfFrames',
        options: [
          { label: '120 frames', value: '120' },
          { label: '180 frames', value: '180' },
          { label: '225 frames', value: '225' },
          { label: '240 frames', value: '240' },
        ],
        correctOption: '225',
      },
      {
        id: 'star-500-vs-npf',
        difficulty: 'intermediate',
        scenario:
          'Your friend uses a 50MP full-frame camera and followed the 500 Rule with a 20mm lens, getting a 25-second exposure. They complain that stars look like short streaks when zoomed in. Why?',
        hint: 'The 500 Rule was designed for older, lower-resolution sensors.',
        successMessage:
          'Exactly! The 500 Rule is too generous for high-resolution sensors. A 50MP full-frame sensor has a pixel pitch of about 4.4 micrometers, and the NPF Rule would recommend roughly 10-12 seconds for truly sharp stars.',
        failureMessage:
          'The 500 Rule was created when sensors had far fewer megapixels. With 50MP, each pixel covers a much smaller slice of sky, revealing star motion that was invisible on older cameras.',
        targetField: 'resolution',
        options: [
          { label: 'The lens was out of focus', value: 'focus' },
          { label: 'The 500 Rule is too generous for high-resolution sensors', value: 'resolution' },
          { label: 'The camera was shaking in the wind', value: 'shake' },
          { label: '20mm is too wide for astrophotography', value: 'too-wide' },
        ],
        correctOption: 'resolution',
      },
      {
        id: 'star-polar-alignment',
        difficulty: 'advanced',
        scenario:
          'You are at 45 degrees north latitude shooting with a 35mm lens aimed directly at Polaris. Compared to aiming at the celestial equator, how does pointing at the pole affect your maximum exposure time for sharp stars?',
        hint: 'Stars near the celestial pole trace very small circles. Their apparent angular velocity across your frame is much lower.',
        successMessage:
          'Correct! Pointing directly at the pole allows significantly longer exposures because stars near Polaris move very slowly across the frame. You could potentially expose 3-5 times longer than when pointed at the equator.',
        failureMessage:
          'Stars near the celestial pole trace tiny circles, barely moving in your frame. This means you can use much longer exposures before trailing becomes visible compared to aiming at the celestial equator.',
        targetField: 'latitude',
        options: [
          { label: 'No difference — star motion is the same everywhere', value: 'same' },
          { label: 'Shorter exposure — polar stars move faster', value: 'shorter' },
          { label: 'Much longer exposure — polar stars barely move across the frame', value: 'longer' },
          { label: 'It depends only on the lens, not the direction', value: 'lens-only' },
        ],
        correctOption: 'longer',
      },
    ],
  },

  // ── Tool 5: nd-filter-calculator ────────────────────────────────────
  {
    slug: 'nd-filter-calculator',
    beginner:
      'An ND (neutral density) filter is like sunglasses for your camera lens. It reduces the amount of light entering the lens without changing the colors, allowing you to use slower shutter speeds or wider apertures in bright conditions. This is how photographers create silky waterfalls, smooth oceans, or blurred clouds during the day.',
    deeper:
      'ND filters are rated by how many stops of light they block. An ND2 filter (1 stop) halves the light, an ND8 (3 stops) reduces it to 1/8th, and an ND1000 (10 stops) reduces light by a factor of 1024. The naming conventions can be confusing: "ND8" means the filter factor is 8 (3 stops), while "ND 0.9" uses optical density notation (each 0.3 = 1 stop, so 0.9 = 3 stops). The resulting shutter speed is simply the base speed multiplied by the filter factor. For example, if your unfiltered exposure is 1/125s and you add a 10-stop ND (ND1000), the new shutter speed is 1/125 x 1024 = approximately 8 seconds. Stacking multiple ND filters adds their stop values together but can introduce vignetting and color casts, especially with wide-angle lenses.',
    keyFactors: [
      {
        label: 'Base Shutter Speed',
        description:
          'The correct exposure time without any filter. Meter the scene first, then calculate the filtered exposure from this starting point.',
      },
      {
        label: 'Filter Strength',
        description:
          'Measured in stops. Each stop doubles the exposure time. Common strengths: 3-stop (ND8), 6-stop (ND64), and 10-stop (ND1000).',
      },
      {
        label: 'Stacking Filters',
        description:
          'You can combine filters by adding their stop values. A 3-stop + 6-stop stack gives 9 stops of reduction. Beware of vignetting on wide-angle lenses.',
      },
    ],
    tips: [
      {
        text: 'Compose and focus before attaching a strong ND filter. With 10 stops of light reduction, your viewfinder and autofocus will struggle in the dark.',
      },
      {
        text: 'For seascapes, 1-2 second exposures smooth small ripples into texture while retaining wave structure. Exposures of 30 seconds or more create completely flat, misty water.',
      },
      {
        text: 'Cheap ND filters often add a color cast (usually magenta or brown). Invest in quality glass from reputable brands, or learn to correct the cast in post-processing using a gray card reference.',
      },
    ],
    tooltips: {
      baseShutterSpeed: {
        term: 'Base Shutter Speed',
        definition:
          'The shutter speed for a correct exposure without any ND filter attached. This is your starting point — the calculator multiplies it by the filter factor.',
      },
      ndFilter: {
        term: 'ND Filter',
        definition:
          'A neutral density filter that uniformly reduces light transmission. Rated by filter factor (ND2, ND4, ND8...) or stops of light reduction. ND2 = 1 stop, ND4 = 2 stops, ND8 = 3 stops, and so on.',
      },
      resultingShutterSpeed: {
        term: 'Resulting Shutter Speed',
        definition:
          'The new shutter speed after accounting for the ND filter. Calculated by multiplying the base shutter speed by the filter factor (e.g., 1/125s x 1024 for a 10-stop ND).',
      },
      stopsAdded: {
        term: 'Stops Added',
        definition:
          'The number of stops of light reduction the ND filter provides. Each stop doubles the required exposure time. 10 stops means the exposure is 1024 times longer.',
      },
    },
    challenges: [
      {
        id: 'nd-basic-calc',
        difficulty: 'beginner',
        scenario:
          'You are at a waterfall and your camera meters a correct exposure at 1/125s without any filter. You attach a 3-stop ND filter (ND8). What is the new shutter speed?',
        hint: 'Each stop doubles the exposure time. 3 stops means 2 x 2 x 2 = 8 times longer.',
        successMessage:
          'Correct! 1/125s x 8 = 1/15s. This is a good start for motion blur in the water, though you might want an even stronger filter for silky smooth results.',
        failureMessage:
          'A 3-stop ND filter multiplies the exposure time by 8 (2^3 = 8). So 1/125s becomes 1/15s.',
        targetField: 'ndFilter',
        options: [
          { label: '1/60s', value: '1/60' },
          { label: '1/30s', value: '1/30' },
          { label: '1/15s', value: '1/15' },
          { label: '1/8s', value: '1/8' },
        ],
        correctOption: '1/15',
      },
      {
        id: 'nd-long-exposure',
        difficulty: 'beginner',
        scenario:
          'You want to create a 30-second exposure of clouds moving across the sky. Without a filter, the correct exposure is 1/30s. How many stops of ND filtration do you need?',
        hint: 'You need to go from 1/30s to 30s — that is 1/30 x factor = 30, so factor = 900. Find the nearest power of 2.',
        successMessage:
          'Correct! Going from 1/30s to 30s is roughly a 1000x increase, which is about 10 stops. An ND1000 (10-stop) filter gets you to approximately 33 seconds.',
        failureMessage:
          'The ratio is 30 / (1/30) = 900. The nearest power of 2 is 1024 (2^10), so you need a 10-stop ND filter.',
        targetField: 'ndFilter',
        options: [
          { label: '6 stops (ND64)', value: '6' },
          { label: '8 stops (ND256)', value: '8' },
          { label: '10 stops (ND1000)', value: '10' },
          { label: '15 stops (ND32768)', value: '15' },
        ],
        correctOption: '10',
      },
      {
        id: 'nd-seascape-timing',
        difficulty: 'intermediate',
        scenario:
          'You are shooting a seascape at sunset. The light is fading and your base exposure (no filter) is now 1/4s at f/11, ISO 100. You want 2-minute exposures for ultra-smooth water. What ND filter strength do you need?',
        hint: 'From 1/4s to 120s is a factor of 480. Find the closest stop value.',
        successMessage:
          'A 9-stop ND would give you 1/4 x 512 = 128 seconds, or just over 2 minutes. Perfect for that misty, ethereal seascape look at sunset.',
        failureMessage:
          'From 0.25s to 120s is about a 480x increase. 2^9 = 512, which is close to 480, so a 9-stop filter gets you to approximately 128 seconds.',
        targetField: 'ndFilter',
        options: [
          { label: '6 stops', value: '6' },
          { label: '9 stops', value: '9' },
          { label: '10 stops', value: '10' },
          { label: '13 stops', value: '13' },
        ],
        correctOption: '9',
      },
      {
        id: 'nd-wide-aperture-sun',
        difficulty: 'intermediate',
        scenario:
          'You want to shoot a portrait at f/1.4 in bright sunlight (base exposure: f/1.4, 1/8000s, ISO 100). Your camera\'s maximum shutter speed is 1/8000s. Can you shoot at f/1.4 without an ND filter?',
        hint: 'Check if 1/8000s at f/1.4 and ISO 100 is achievable, or if the scene is still overexposed.',
        successMessage:
          'Correct! On a very bright day (EV 15+), f/1.4 at ISO 100 often needs shutter speeds faster than 1/8000s, which most cameras cannot achieve. A 2-3 stop ND filter lets you shoot wide open without overexposure.',
        failureMessage:
          'In bright sunlight, f/1.4 at ISO 100 may require shutter speeds beyond the camera\'s 1/8000s limit. An ND filter is essential for wide-aperture shooting in bright conditions.',
        targetField: 'ndFilter',
        options: [
          { label: 'Yes — 1/8000s is fast enough', value: 'yes' },
          { label: 'No — you likely need a 2-3 stop ND filter', value: 'need-nd' },
          { label: 'Just raise ISO to compensate', value: 'raise-iso' },
        ],
        correctOption: 'need-nd',
      },
      {
        id: 'nd-stack-calc',
        difficulty: 'advanced',
        scenario:
          'You own a 6-stop and a 3-stop ND filter. You stack them on your lens with a base exposure of 1/250s. What is the resulting shutter speed, and what should you watch for with this setup?',
        hint: 'Add the stop values together, then calculate the new exposure. Think about optical side effects of stacking.',
        successMessage:
          'Correct! 6 + 3 = 9 stops. 1/250 x 512 = approximately 2 seconds. Watch for vignetting (dark corners) on wide-angle lenses and potential color casts from cheap glass.',
        failureMessage:
          'Stacking adds the stop values: 6 + 3 = 9 stops total. 2^9 = 512, so 1/250 x 512 = ~2 seconds. Stacking can also cause vignetting and color casts.',
        targetField: 'ndFilter',
        options: [
          { label: '~0.5s, watch for lens flare', value: '0.5' },
          { label: '~2s, watch for vignetting and color casts', value: '2-vignette' },
          { label: '~4s, watch for sensor overheating', value: '4-heat' },
          { label: '~8s, no concerns with stacking', value: '8-fine' },
        ],
        correctOption: '2-vignette',
      },
    ],
  },

  // ── Tool 6: white-balance-visualizer ────────────────────────────────
  {
    slug: 'white-balance-visualizer',
    beginner:
      'White balance adjusts the colors in your photo so that white objects actually appear white under any lighting. Different light sources have different color temperatures — a candle is warm and orange, while shade is cool and blue. Your camera\'s white balance setting compensates for these differences so colors look natural.',
    deeper:
      'Color temperature is measured in Kelvin (K) and corresponds to the color of light emitted by an ideal "black body" heated to that temperature. Lower values (2000-3500K) produce warm, reddish-orange light (incandescent bulbs, candles), while higher values (6500-10000K) produce cool, bluish light (shade, overcast sky). The camera\'s white balance system applies the inverse color shift to neutralize the ambient color cast. When you set white balance to "Tungsten" (~3200K), the camera adds blue to counteract the orange cast from incandescent lights. In digital photography, white balance is applied as a multiplier to the red and blue channels relative to green. Shooting in RAW format preserves all color data and allows you to change white balance freely in post-processing with zero quality loss — it is simply a metadata tag applied during conversion.',
    keyFactors: [
      {
        label: 'Color Temperature (Kelvin)',
        description:
          'The numerical measure of light color. Low Kelvin = warm/orange light. High Kelvin = cool/blue light. Daylight is approximately 5500K.',
      },
      {
        label: 'Light Source',
        description:
          'Different sources emit different color temperatures: candles (~1800K), tungsten bulbs (~2800K), fluorescent tubes (~4000K), midday sun (~5500K), cloudy sky (~6500K), shade (~7500K).',
      },
      {
        label: 'RAW vs JPEG',
        description:
          'Shooting RAW lets you change white balance in post with no quality loss. JPEG bakes in the white balance permanently, so getting it right in-camera matters more.',
      },
      {
        label: 'Mixed Lighting',
        description:
          'Scenes with multiple light sources at different temperatures (e.g., window daylight + tungsten lamps) make it impossible to perfectly neutralize all colors simultaneously.',
      },
    ],
    tips: [
      {
        text: 'Always shoot RAW if you want full flexibility to adjust white balance later. RAW files store the unprocessed sensor data, so white balance changes are lossless.',
      },
      {
        text: 'For creative effect, try intentionally "mismatching" white balance. Setting a daylight WB during golden hour makes sunsets even warmer, while a tungsten WB outdoors creates a dramatic cold blue look.',
      },
      {
        text: 'In mixed lighting situations (e.g., a room lit by both window light and tungsten lamps), use a gray card to set a custom white balance, or gel your flash to match the ambient light source.',
      },
    ],
    tooltips: {
      colorTemperature: {
        term: 'Color Temperature',
        definition:
          'A measure of light color in Kelvin (K). Based on the theoretical color of a heated black body. Lower values are warmer (orange/red), higher values are cooler (blue).',
      },
      preset: {
        term: 'White Balance Preset',
        definition:
          'A predefined white balance setting calibrated for a common light source. Presets include Tungsten (~3200K), Fluorescent (~4000K), Daylight (~5500K), Cloudy (~6500K), and Shade (~7500K).',
      },
      rgbValues: {
        term: 'RGB Values',
        definition:
          'The red, green, and blue channel values (0-255 each) that represent the color of light at the selected temperature. Used to visualize how the light source tints the scene.',
      },
      hexCode: {
        term: 'Hex Code',
        definition:
          'A six-character hexadecimal representation of the color (e.g., #FF8C00). Useful for referencing the exact color in design software or web development.',
      },
    },
    challenges: [
      {
        id: 'wb-indoor-orange',
        difficulty: 'beginner',
        scenario:
          'Your indoor photos under regular household light bulbs look very orange/yellow. Which white balance preset should you use to fix this?',
        hint: 'Household incandescent bulbs emit warm, orange-toned light around 2800-3200K.',
        successMessage:
          'Correct! The Tungsten preset adds blue to counteract the orange cast of incandescent bulbs, bringing colors back to neutral.',
        failureMessage:
          'Incandescent/tungsten bulbs emit warm orange light. The Tungsten white balance preset is specifically designed to neutralize this cast by adding blue.',
        targetField: 'colorTemperature',
        options: [
          { label: 'Daylight', value: 'daylight' },
          { label: 'Tungsten', value: 'tungsten' },
          { label: 'Shade', value: 'shade' },
          { label: 'Fluorescent', value: 'fluorescent' },
        ],
        correctOption: 'tungsten',
      },
      {
        id: 'wb-golden-hour',
        difficulty: 'beginner',
        scenario:
          'You are shooting portraits during golden hour and want to keep the beautiful warm glow of the sunset. Which white balance setting should you use?',
        hint: 'If you set the "correct" WB for golden hour, it would neutralize the warm tones you want to keep.',
        successMessage:
          'Correct! Using the Daylight preset (or even Cloudy/Shade) during golden hour preserves and enhances the warm tones instead of neutralizing them.',
        failureMessage:
          'To preserve the warm glow of golden hour, use a WB that does not compensate for warm light. Daylight or higher presets will keep (and even enhance) the warmth.',
        targetField: 'colorTemperature',
        options: [
          { label: 'Auto White Balance', value: 'auto' },
          { label: 'Tungsten (to neutralize the warmth)', value: 'tungsten' },
          { label: 'Daylight (to preserve the warmth)', value: 'daylight' },
          { label: 'Flash', value: 'flash' },
        ],
        correctOption: 'daylight',
      },
      {
        id: 'wb-kelvin-direction',
        difficulty: 'intermediate',
        scenario:
          'You are manually adjusting white balance in Kelvin. Your photo looks too blue/cold. Should you increase or decrease the Kelvin value to warm it up?',
        hint: 'The Kelvin WB setting tells the camera what color temperature the light source is. Setting a higher Kelvin value makes the camera add more warmth.',
        successMessage:
          'Right! Increasing the Kelvin value tells the camera the light is cooler than it actually is, so the camera compensates by adding warmth. Set a higher K to warm up a cold-looking image.',
        failureMessage:
          'When you increase the Kelvin value, the camera adds more warmth to compensate. So to fix a cold/blue image, raise the Kelvin number.',
        targetField: 'colorTemperature',
        options: [
          { label: 'Increase Kelvin (e.g., 5500K to 7500K)', value: 'increase' },
          { label: 'Decrease Kelvin (e.g., 5500K to 3200K)', value: 'decrease' },
          { label: 'Kelvin direction does not affect warmth', value: 'no-effect' },
        ],
        correctOption: 'increase',
      },
      {
        id: 'wb-mixed-light',
        difficulty: 'intermediate',
        scenario:
          'You are photographing a restaurant interior that has warm tungsten pendant lights overhead and cool blue daylight streaming through large windows. People near the windows look blue, and people under the lamps look orange. What is the best approach?',
        hint: 'No single white balance setting can correct two very different color temperatures simultaneously.',
        successMessage:
          'Exactly! Gelling the flash or additional lights to match one dominant source, or choosing a compromise WB and correcting selectively in post, are the best approaches for mixed lighting.',
        failureMessage:
          'Mixed lighting is one of the hardest WB challenges. A single WB cannot correct both sources simultaneously. You need to either match the sources with gels or fix it selectively in post.',
        targetField: 'colorTemperature',
        options: [
          { label: 'Set WB to Tungsten — it will fix everything', value: 'tungsten' },
          { label: 'Set WB to Daylight — windows are more important', value: 'daylight' },
          { label: 'Use Auto WB and shoot RAW, then correct each zone in post', value: 'raw-post' },
          { label: 'Raise ISO to make colors more accurate', value: 'iso' },
        ],
        correctOption: 'raw-post',
      },
      {
        id: 'wb-creative-cold',
        difficulty: 'advanced',
        scenario:
          'You are shooting a moody, cinematic night scene in a city and want an intentional cold blue tone. The streetlights are sodium vapor (~2200K). What Kelvin white balance setting would give you the strongest blue shift?',
        hint: 'Setting WB much lower than the actual light source temperature will shift the image toward blue.',
        successMessage:
          'Correct! Setting the WB to around 2200K (matching the sodium lights) would neutralize the color. Setting it lower — like Tungsten at 3200K — actually warms things. But for a blue shift, you would set WB to a low Kelvin value like 2500-3000K... wait, that is counterintuitive! Actually, the sodium lights at 2200K are already very warm. Setting WB to 3200K or higher tells the camera the light is warmer than it is and adds blue. The highest WB value produces the strongest blue shift.',
        failureMessage:
          'Setting a WB Kelvin value much higher than the actual light source temperature makes the camera add maximum blue. With 2200K sodium lights, setting WB to 7500K+ creates the strongest cold blue look.',
        targetField: 'colorTemperature',
        options: [
          { label: '2200K (matching the sodium lights)', value: '2200' },
          { label: '3200K (Tungsten preset)', value: '3200' },
          { label: '7500K or higher (Shade preset)', value: '7500' },
          { label: '5500K (Daylight preset)', value: '5500' },
        ],
        correctOption: '7500',
      },
    ],
  },

  // ── Tool 7: shutter-speed-guide ─────────────────────────────────────
  {
    slug: 'shutter-speed-guide',
    beginner:
      'The shutter speed guide helps you find the slowest shutter speed you can use while still getting a sharp handheld photo. If your shutter speed is too slow, camera shake from your hands will blur the image. The minimum safe speed depends on your focal length, whether you have image stabilization, and how steady your hands are.',
    deeper:
      'The classic "reciprocal rule" states that for sharp handheld photos, your shutter speed should be at least 1/(focal length) seconds — so a 200mm lens needs at least 1/200s. On crop-sensor cameras, you should use the equivalent focal length (e.g., 200mm on a 1.5x crop = 1/300s). Modern in-body stabilization (IBIS) and optical stabilization (OIS) can buy you 3-7 extra stops of handheld leeway, meaning that stabilized 200mm lens might be sharp at 1/15s or even slower. However, stabilization only compensates for camera shake, not subject motion. A person walking toward you at 1/15s will still be blurred regardless of stabilization. For moving subjects, you must select a shutter speed based on the subject\'s speed and distance, not just the focal length.',
    keyFactors: [
      {
        label: 'Focal Length',
        description:
          'Longer focal lengths magnify camera shake. The reciprocal rule (1/focal length) is the starting point for determining minimum shutter speed.',
      },
      {
        label: 'Image Stabilization',
        description:
          'OIS (lens-based) typically provides 2-4 stops of benefit. IBIS (body-based) provides 3-5 stops. Combined OIS+IBIS can achieve 5-7 stops on some systems.',
      },
      {
        label: 'Subject Motion',
        description:
          'Still subjects require only enough speed to counter camera shake. Moving subjects need faster speeds regardless of stabilization: walking (~1/125s), running (~1/500s), vehicles (~1/1000s+).',
      },
      {
        label: 'Sensor Size (Crop Factor)',
        description:
          'Crop-sensor cameras effectively multiply the focal length for the reciprocal rule. A 50mm lens on a 1.5x crop behaves like 75mm, so you need at least 1/75s.',
      },
    ],
    tips: [
      {
        text: 'Brace yourself against a wall, tuck your elbows in, and exhale slowly before pressing the shutter. Good technique can give you 1-2 extra stops of steadiness beyond the reciprocal rule.',
      },
      {
        text: 'When shooting people, the subject\'s motion usually dictates your minimum speed, not your focal length. Even with a wide-angle lens and stabilization, a child running requires at least 1/500s.',
      },
      {
        text: 'If you are consistently shooting in low light, invest in a camera body with IBIS. The ability to shoot handheld at 1/2s with a wide-angle lens opens up possibilities that no amount of high-ISO performance can match.',
      },
    ],
    tooltips: {
      focalLength: {
        term: 'Focal Length',
        definition:
          'The lens focal length in millimeters. Directly affects the minimum safe shutter speed through the reciprocal rule: 1/(focal length) for full-frame, adjusted by crop factor for smaller sensors.',
      },
      sensor: {
        term: 'Sensor Size',
        definition:
          'The camera sensor size, which determines the crop factor. APS-C (1.5x) and Micro Four Thirds (2x) multiply the effective focal length, requiring faster shutter speeds for the same lens.',
      },
      stabilization: {
        term: 'Image Stabilization',
        definition:
          'Technology that compensates for camera shake. OIS (Optical Image Stabilization) is in the lens, IBIS (In-Body Image Stabilization) is in the camera body. They can work together for maximum benefit.',
      },
      subjectMotion: {
        term: 'Subject Motion',
        definition:
          'How fast your subject is moving. Still subjects only need enough shutter speed to counteract camera shake. Moving subjects need faster speeds based on their velocity and direction relative to the camera.',
      },
      recommendedShutterSpeed: {
        term: 'Recommended Shutter Speed',
        definition:
          'The minimum shutter speed calculated for your specific combination of focal length, stabilization, sensor, and subject motion. Shooting at this speed or faster should produce sharp results.',
      },
    },
    challenges: [
      {
        id: 'ss-reciprocal-basic',
        difficulty: 'beginner',
        scenario:
          'You are shooting with a 100mm lens on a full-frame camera with no image stabilization. Your subject is standing still. What is the minimum recommended shutter speed?',
        hint: 'The reciprocal rule: minimum shutter speed = 1 / focal length.',
        successMessage:
          'Correct! The reciprocal rule says 1/100s for a 100mm lens on full frame. This is the classic starting point for handheld sharpness.',
        failureMessage:
          'For a 100mm lens on full frame with no stabilization, the reciprocal rule gives you 1/100s as the minimum safe shutter speed for static subjects.',
        targetField: 'focalLength',
        options: [
          { label: '1/50s', value: '1/50' },
          { label: '1/100s', value: '1/100' },
          { label: '1/200s', value: '1/200' },
          { label: '1/500s', value: '1/500' },
        ],
        correctOption: '1/100',
      },
      {
        id: 'ss-crop-factor',
        difficulty: 'beginner',
        scenario:
          'You are using a 50mm lens on an APS-C camera (1.5x crop factor) with no stabilization. What minimum shutter speed should you use for a still subject?',
        hint: 'Multiply the focal length by the crop factor before applying the reciprocal rule.',
        successMessage:
          'Right! 50mm x 1.5 = 75mm equivalent, so you need at least 1/75s. In practice, rounding up to 1/80s is the safe choice.',
        failureMessage:
          'On APS-C, the crop factor (1.5x) means a 50mm lens behaves like a 75mm lens. The reciprocal rule gives 1/75s as the minimum speed.',
        targetField: 'sensor',
        options: [
          { label: '1/50s', value: '1/50' },
          { label: '1/75s (round to 1/80s)', value: '1/75' },
          { label: '1/100s', value: '1/100' },
          { label: '1/125s', value: '1/125' },
        ],
        correctOption: '1/75',
      },
      {
        id: 'ss-ibis-benefit',
        difficulty: 'intermediate',
        scenario:
          'You have a 200mm lens with OIS (4 stops of stabilization) on a full-frame body with IBIS (5 stops). Together they provide about 6 stops of combined stabilization. For a still subject, what is the approximate minimum shutter speed?',
        hint: 'Start with the reciprocal rule (1/200s) and then apply 6 stops of stabilization benefit.',
        successMessage:
          'Correct! Starting at 1/200s and gaining 6 stops: 1/200 -> 1/100 -> 1/50 -> 1/25 -> 1/13 -> 1/6 -> 1/3s. About 1/3 second handheld with a 200mm lens — impressive but achievable with modern stabilization!',
        failureMessage:
          'From 1/200s, each stop of stabilization doubles the usable time: 1/200 -> 1/100 -> 1/50 -> 1/25 -> 1/13 -> 1/6 -> 1/3s. Six stops of stabilization with a 200mm lens gives approximately 1/3s.',
        targetField: 'stabilization',
        options: [
          { label: '1/30s', value: '1/30' },
          { label: '1/8s', value: '1/8' },
          { label: '~1/3s', value: '1/3' },
          { label: '1 second', value: '1s' },
        ],
        correctOption: '1/3',
      },
      {
        id: 'ss-moving-subject',
        difficulty: 'intermediate',
        scenario:
          'You are photographing a friend jogging in a park using a 35mm lens on a full-frame camera with IBIS. Your IBIS gives you 5 stops of stabilization, so the reciprocal rule alone would let you shoot at about 1 second. Should you use 1 second?',
        hint: 'Stabilization compensates for camera shake, not subject motion.',
        successMessage:
          'Correct! Stabilization only counters camera shake. A jogging person needs at least 1/250s to freeze their motion, regardless of how good your stabilization is.',
        failureMessage:
          'Stabilization cannot freeze a moving subject. For a person jogging, you need at least 1/250s to prevent motion blur, even if your camera could hold steady at 1 second.',
        targetField: 'subjectMotion',
        options: [
          { label: 'Yes — IBIS handles all the motion', value: 'yes-ibis' },
          { label: 'No — use at least 1/250s to freeze the jogger', value: 'no-250' },
          { label: 'No — use 1/60s as a compromise', value: 'no-60' },
          { label: 'It depends on the ISO setting', value: 'depends-iso' },
        ],
        correctOption: 'no-250',
      },
      {
        id: 'ss-panning-technique',
        difficulty: 'advanced',
        scenario:
          'You want to create a panning shot of a cyclist — the rider should be sharp while the background shows motion blur streaks. You are using a 70mm lens on full frame. What shutter speed range should you try?',
        hint: 'Panning intentionally uses a slow shutter speed while tracking the subject. Too fast freezes everything; too slow blurs even the subject.',
        successMessage:
          'Correct! For panning a cyclist, 1/30s to 1/60s is the sweet spot. This is slow enough to blur the background into streaks while your tracking motion keeps the rider relatively sharp. It takes practice — shoot in burst mode and expect many rejects.',
        failureMessage:
          'Panning requires a shutter speed slow enough to blur the background but fast enough that your tracking keeps the subject sharp. For a cyclist, 1/30s to 1/60s is the typical range.',
        targetField: 'shutterSpeed',
        options: [
          { label: '1/1000s to 1/2000s', value: 'very-fast' },
          { label: '1/250s to 1/500s', value: 'fast' },
          { label: '1/30s to 1/60s', value: 'panning-range' },
          { label: '1s to 2s', value: 'very-slow' },
        ],
        correctOption: 'panning-range',
      },
    ],
  },
]
