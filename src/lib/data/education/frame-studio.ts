import type { ToolEducation } from './types'

export const FRAME_STUDIO_EDUCATION: ToolEducation = {
  slug: 'frame-studio',
  beginner:
    'Frame Studio helps you crop, frame, and compose your photos right in the browser. Use composition grids to improve your framing, crop to popular aspect ratios, and add professional-looking borders — all without losing any image quality.',
  deeper: [
    {
      heading: 'Composition Grids',
      text: 'The Rule of Thirds divides the frame into a 3×3 grid — placing subjects along lines or at intersections creates natural visual balance. The Golden Ratio (approximately 1.618:1) provides a mathematically harmonious division used in art and architecture for centuries. The Golden Spiral guides the eye along a logarithmic curve derived from the Fibonacci sequence, useful for leading the viewer through the image.',
    },
    {
      heading: 'Aspect Ratios',
      text: 'Different aspect ratios serve different purposes. 1:1 (square) works well for social media and symmetrical compositions. 3:2 is the classic 35mm film ratio. 4:3 is common in micro four-thirds and older digital cameras. 16:9 is the standard widescreen ratio for video and cinematic compositions. 5:4 is traditional for 8×10 prints.',
    },
    {
      heading: 'Framing and Borders',
      text: 'Adding a border around a photograph mimics the effect of a physical mat and frame. A white mat provides visual breathing room and directs focus inward. The width of the border relative to the image affects the perceived "weight" of the photograph. Gallery-style presentations typically use wider mats. A subtle shadow creates depth, simulating how a framed print sits on a wall.',
    },
  ],
  keyFactors: [
    { label: 'Composition Grid', description: 'Overlay guides help you evaluate and improve subject placement within the frame.' },
    { label: 'Aspect Ratio', description: 'The width-to-height proportion affects how the image feels — wider ratios feel cinematic, square feels balanced.' },
    { label: 'Border Width', description: 'Wider borders add gravitas and focus; narrow borders feel modern and minimal.' },
    { label: 'Mat Color', description: 'White mats are classic for art photography. Dark mats emphasize lighter images. Color mats can complement or contrast.' },
  ],
  tips: [
    { text: 'For Instagram posts, crop to 4:5 (portrait) to take up maximum screen space in the feed.' },
    { text: 'When adding a border for print, use a mat width of at least 10% of the image\'s shorter dimension for a professional look.' },
    { text: 'The Golden Spiral is most effective for images with a natural flow — water, roads, or curved architecture.' },
  ],
  tooltips: {
    'Aspect Ratio': { term: 'Aspect Ratio', definition: 'The proportional relationship between width and height. Common ratios include 3:2 (35mm), 4:3 (M43), and 16:9 (widescreen).' },
    'Rule of Thirds': { term: 'Rule of Thirds', definition: 'A composition guideline that divides the frame into 9 equal parts. Placing subjects at intersection points creates visual interest.' },
    'Golden Ratio': { term: 'Golden Ratio', definition: 'A mathematical proportion (~1.618:1) found in nature and art. Creates aesthetically pleasing divisions of space.' },
    'Border Width': { term: 'Border Width', definition: 'The thickness of the frame border in pixels. Goes outside the image, increasing total dimensions without cropping.' },
    'Inner Mat': { term: 'Inner Mat', definition: 'A second, thinner border between the outer frame and the image — mimics the beveled inner mat of a physical picture frame.' },
    'Corner Radius': { term: 'Corner Radius', definition: 'Rounds the corners of the frame border. Zero gives sharp corners, higher values give a softer, rounded look.' },
  },
  challenges: [
    {
      id: 'fs-beginner-1',
      difficulty: 'beginner',
      scenario: 'You want to post a portrait photo on Instagram for maximum feed presence. Which aspect ratio should you use?',
      hint: 'Instagram portrait posts use a taller-than-wide ratio.',
      successMessage: 'Correct! 4:5 gives you the maximum vertical space in the Instagram feed.',
      failureMessage: 'Instagram portrait posts use 4:5 (flip 5:4 to portrait orientation) for maximum feed real estate.',
      targetField: 'aspectRatio',
      options: [
        { label: '1:1 (Square)', value: '1:1' },
        { label: '4:5 (Portrait)', value: '4:5' },
        { label: '16:9 (Widescreen)', value: '16:9' },
      ],
      correctOption: '4:5',
    },
    {
      id: 'fs-beginner-2',
      difficulty: 'beginner',
      scenario: 'Which composition grid is the most widely taught starting point for beginners?',
      hint: 'It divides the frame into 9 equal sections.',
      successMessage: 'Right! The Rule of Thirds is the foundational composition guide.',
      failureMessage: 'The Rule of Thirds (3×3 grid) is the most common starting point for learning composition.',
      targetField: 'grid',
      options: [
        { label: 'Rule of Thirds', value: 'rule-of-thirds' },
        { label: 'Golden Spiral', value: 'golden-spiral' },
        { label: 'Diagonal Lines', value: 'diagonal-lines' },
      ],
      correctOption: 'rule-of-thirds',
    },
    {
      id: 'fs-intermediate-1',
      difficulty: 'intermediate',
      scenario: 'You are preparing a photo for gallery printing on 8×10 paper. Which aspect ratio matches this print size?',
      hint: '8÷10 simplifies to a well-known ratio.',
      successMessage: 'Correct! 5:4 matches 8×10 print dimensions perfectly.',
      failureMessage: '8×10 simplifies to 4:5, which is the portrait version of 5:4.',
      targetField: 'aspectRatio',
      options: [
        { label: '3:2', value: '3:2' },
        { label: '5:4', value: '5:4' },
        { label: '4:3', value: '4:3' },
      ],
      correctOption: '5:4',
    },
    {
      id: 'fs-intermediate-2',
      difficulty: 'intermediate',
      scenario: 'A landscape photo features a winding river leading from the foreground to mountains in the background. Which grid overlay best matches this natural flow?',
      hint: 'One grid type follows a natural curved path.',
      successMessage: 'Great choice! The Golden Spiral follows curves and leading lines perfectly.',
      failureMessage: 'The Golden Spiral is ideal for images with natural curved elements like rivers, roads, or coastlines.',
      targetField: 'grid',
      options: [
        { label: 'Center Cross', value: 'center-cross' },
        { label: 'Golden Spiral', value: 'golden-spiral' },
        { label: 'Square Grid', value: 'square-grid' },
      ],
      correctOption: 'golden-spiral',
    },
    {
      id: 'fs-advanced-1',
      difficulty: 'advanced',
      scenario: 'You want a clean white border to present your photo on social media. Which frame preset should you use?',
      hint: 'Think about which preset gives you a simple white border.',
      successMessage: 'Correct! The White preset adds a 100px white border around your photo.',
      failureMessage: 'The White preset is designed for a clean, simple white border presentation.',
      targetField: 'preset',
      options: [
        { label: 'None', value: 'none' },
        { label: 'White', value: 'white' },
        { label: 'Black', value: 'black' },
      ],
      correctOption: 'white',
    },
  ],
}
