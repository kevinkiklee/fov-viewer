export interface Scene {
  id: string
  name: string
  src: string
  altText: string
}

export const SCENES: Scene[] = [
  { id: 'landscape', name: 'Landscape', src: '/images/scenes/landscape.jpg', altText: 'Field of view simulator mountain landscape scene comparing focal lengths' },
  { id: 'cityscape', name: 'Cityscape', src: '/images/scenes/cityscape.jpg', altText: 'Field of view simulator urban cityscape scene comparing focal lengths' },
  { id: 'street', name: 'Street', src: '/images/scenes/street.jpg', altText: 'Field of view simulator street photography scene comparing focal lengths' },
  { id: 'wildlife', name: 'Wildlife', src: '/images/scenes/wildlife.jpg', altText: 'Field of view simulator wildlife animal scene comparing focal lengths' },
]
