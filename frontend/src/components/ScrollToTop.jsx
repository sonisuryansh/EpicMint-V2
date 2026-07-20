import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop helper component to automatically reset window scroll position
 * whenever the React Router pathname changes.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}
