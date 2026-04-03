'use client'

import { usePathname } from 'next/navigation'
import { getToolBySlug } from '@/lib/data/tools'
import type { ToolCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  visualizer: 'Visualizers',
  calculator: 'Calculators',
  reference: 'Reference',
  'file-tool': 'File Tools',
}

export function JsonLd() {
  const pathname = usePathname()
  
  if (!pathname) return null

  if (pathname.startsWith('/tools/')) {
    const slug = pathname.split('/').pop()
    if (!slug) return null
    const tool = getToolBySlug(slug)
    
    if (tool) {
      const softwareApp = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.description,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: `https://www.phototools.io/tools/${tool.slug}`,
      }

      const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.phototools.io',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: CATEGORY_LABELS[tool.category],
            item: `https://www.phototools.io/#${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: `https://www.phototools.io/tools/${tool.slug}`,
          },
        ],
      }

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
          />
        </>
      )
    }
  }

  return null
}
