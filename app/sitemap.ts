import { MetadataRoute } from 'next'
import { getLiveTools } from '@/lib/data/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.phototools.io'
  
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/learn/glossary`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Add all live tools
  const tools = getLiveTools()
  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  return [...routes, ...toolRoutes]
}
