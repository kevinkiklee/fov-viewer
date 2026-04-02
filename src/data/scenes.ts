import person from '../assets/person.jpg'
import portrait from '../assets/portrait.jpg'
import bird from '../assets/bird2.jpg'
import city from '../assets/city.jpg'
import milkyway from '../assets/milkyway.jpg'

export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'person', name: 'Landscape', src: person },
  { id: 'portrait', name: 'Portrait', src: portrait },
  { id: 'bird', name: 'Bird', src: bird },
  { id: 'city', name: 'City Street', src: city },
  { id: 'milkyway', name: 'Milky Way', src: milkyway },
]
