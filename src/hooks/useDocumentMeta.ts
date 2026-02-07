import { useEffect } from 'react'

interface MetaConfig {
  title: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogType?: string
  ogImage?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  robots?: string
}

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, name)
    document.head.appendChild(element)
  }

  element.content = content
}

export function useDocumentMeta(config: MetaConfig) {
  useEffect(() => {
    // Set title
    document.title = config.title

    // Set meta tags
    if (config.description) {
      setMetaTag('description', config.description)
    }

    if (config.ogTitle) {
      setMetaTag('og:title', config.ogTitle, true)
    }

    if (config.ogDescription) {
      setMetaTag('og:description', config.ogDescription, true)
    }

    if (config.ogType) {
      setMetaTag('og:type', config.ogType, true)
    }

    if (config.ogImage) {
      setMetaTag('og:image', config.ogImage, true)
    }

    if (config.twitterCard) {
      setMetaTag('twitter:card', config.twitterCard)
    }

    if (config.twitterTitle) {
      setMetaTag('twitter:title', config.twitterTitle)
    }

    if (config.twitterDescription) {
      setMetaTag('twitter:description', config.twitterDescription)
    }

    if (config.robots) {
      setMetaTag('robots', config.robots)
    }
  }, [config])
}

