import type { MetadataRoute } from 'next'
import { ALLOW_INDEXING, SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api', '/mypage', '/myproject', '/navigate'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
