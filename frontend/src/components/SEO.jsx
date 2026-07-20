import { useEffect } from 'react'

/**
 * SEO helper component to inject title, meta descriptions, OpenGraph, and Twitter tags
 */
export default function SEO({ title, description, image, url }) {
    useEffect(() => {
        const defaultTitle = 'EpicMint — Premium NFT Marketplace on Ethereum'
        const defaultDesc = 'Mint, collect, and trade high-resolution digital collectibles powered by OpenZeppelin v5 and Pinata IPFS.'
        const defaultImg = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'

        document.title = title ? `${title} — EpicMint` : defaultTitle

        const metaTags = [
            { name: 'description', content: description || defaultDesc },
            { property: 'og:title', content: title || defaultTitle },
            { property: 'og:description', content: description || defaultDesc },
            { property: 'og:image', content: image || defaultImg },
            { property: 'og:url', content: url || window.location.href },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title || defaultTitle },
            { name: 'twitter:description', content: description || defaultDesc },
            { name: 'twitter:image', content: image || defaultImg },
        ]

        metaTags.forEach(({ name, property, content }) => {
            const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
            let el = document.querySelector(selector)
            if (!el) {
                el = document.createElement('meta')
                if (name) el.setAttribute('name', name)
                if (property) el.setAttribute('property', property)
                document.head.appendChild(el)
            }
            el.setAttribute('content', content)
        })
    }, [title, description, image, url])

    return null
}
