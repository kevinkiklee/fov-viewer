import landscape from '../assets/landscape-boat-lake.jpg'
import portrait from '../assets/portrait-woman.jpg'
import bird from '../assets/wildlife-condor.jpg'
import city from '../assets/city-street.jpg'
import milkyway from '../assets/milky-way-night-sky.jpg'

export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'landscape', name: 'Landscape', src: landscape },
  { id: 'portrait', name: 'Portrait', src: portrait },
  { id: 'wildlife', name: 'Wildlife', src: bird },
  { id: 'city', name: 'City Street', src: city },
  { id: 'milkyway', name: 'Milky Way', src: milkyway },
]
