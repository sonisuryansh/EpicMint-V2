import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Web3Provider } from './contexts/Web3Context'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRouteHandler from './components/AuthRouteHandler'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import Create from './pages/Create'
import NFTDetail from './pages/NFTDetail'
import Profile from './pages/Profile'
import { WalletOnboardingModal } from './components'
import { ToastProvider } from './components/Toast'
import './index.css'

// Lazy-loaded footer & resource pages for performance & SEO
const Documentation = lazy(() => import('./pages/Documentation'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const CreateBlog = lazy(() => import('./pages/CreateBlog'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Support = lazy(() => import('./pages/Support'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('epicmint_theme') || 'dark'
    })

    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('epicmint_theme', theme)
    }, [theme])

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    return (
        <AuthProvider>
            <Web3Provider>
                <ToastProvider>
                    <Router>
                        <ScrollToTop />
                        <div className="page-wrapper">
                            <Navigation theme={theme} toggleTheme={toggleTheme} />
                            <main className="main-content">
                                <Suspense fallback={
                                    <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
                                        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
                                        <p className="text-muted">Loading page...</p>
                                    </div>
                                }>
                                    <Routes>
                                        {/* Public Main Routes */}
                                        <Route path="/" element={<Home />} />
                                        <Route path="/marketplace" element={<Marketplace />} />
                                        <Route path="/nft/:id" element={<NFTDetail />} />
                                        <Route path="/nft/:contractAddress/:tokenId" element={<NFTDetail />} />

                                        {/* Auth Deep-Link Routes */}
                                        <Route path="/signin" element={<AuthRouteHandler mode="signin" />} />
                                        <Route path="/signup" element={<AuthRouteHandler mode="signup" />} />

                                        {/* Protected Routes */}
                                        <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
                                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                        <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />

                                        {/* Footer & Resource Pages */}
                                        <Route path="/docs" element={<Documentation />} />
                                        <Route path="/blog" element={<Blog />} />
                                        <Route path="/blog/:slug" element={<BlogDetail />} />
                                        <Route path="/faq" element={<FAQ />} />
                                        <Route path="/support" element={<Support />} />

                                        {/* Legal Pages */}
                                        <Route path="/privacy" element={<PrivacyPolicy />} />
                                        <Route path="/terms" element={<TermsOfService />} />
                                        <Route path="/cookies" element={<CookiePolicy />} />

                                        {/* Safe Wildcard Fallback for Invalid Routes */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Suspense>
                            </main>
                            <Footer />

                            {/* Wallet Onboarding Modal */}
                            <WalletOnboardingModal />

                            {/* Scroll to top */}
                            <button
                                className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                aria-label="Scroll to top"
                            >
                                ↑
                            </button>
                        </div>
                    </Router>
                </ToastProvider>
            </Web3Provider>
        </AuthProvider>
    )
}

export default App
