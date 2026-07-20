import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../lib/api'
import web3Service from '../lib/web3'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('epicmint_user')
            return stored ? JSON.parse(stored) : null
        } catch { return null }
    })
    const [token, setToken] = useState(() => localStorage.getItem('epicmint_token') || null)
    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState(null)
    const [showWalletOnboarding, setShowWalletOnboarding] = useState(false)

    const isAuthenticated = !!token && !!user

    // Persist auth state
    const saveAuth = useCallback((userData, tokenData) => {
        setUser(userData)
        setToken(tokenData)
        localStorage.setItem('epicmint_user', JSON.stringify(userData))
        localStorage.setItem('epicmint_token', tokenData)
        if (userData && !userData.walletAddress) {
            setShowWalletOnboarding(true)
        }
    }, [])

    const clearAuth = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('epicmint_user')
        localStorage.removeItem('epicmint_token')
        web3Service.disconnect()
    }, [])

    // Listen for 401 events from API interceptor
    useEffect(() => {
        const handle = () => clearAuth()
        window.addEventListener('auth:logout', handle)
        return () => window.removeEventListener('auth:logout', handle)
    }, [clearAuth])

    // Validate token on mount
    useEffect(() => {
        if (token && !user) {
            authAPI.getMe()
                .then(res => setUser(res.data.user))
                .catch(() => clearAuth())
        }
    }, [])

    /**
     * Login with email + password
     */
    const login = useCallback(async (email, password) => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await authAPI.login({ email, password })
            saveAuth(res.data.user, res.data.token)
            return res.data.user
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [saveAuth])

    /**
     * Register with email + password
     */
    const register = useCallback(async (username, email, password) => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await authAPI.register({ username, email, password })
            saveAuth(res.data.user, res.data.token)
            return res.data.user
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [saveAuth])

    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates }
            localStorage.setItem('epicmint_user', JSON.stringify(updated))
            return updated
        })
    }, [])

    /**
     * Authenticate with Google OAuth Token
     */
    const loginWithGoogle = useCallback(async (idToken) => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await authAPI.googleAuth(idToken)
            saveAuth(res.data.user, res.data.token)
            return res.data.user
        } catch (err) {
            const msg = err.response?.data?.message || 'Google authentication failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [saveAuth])

    /**
     * Link Google account to existing user session
     */
    const linkGoogleAccount = useCallback(async (idToken) => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await authAPI.linkGoogle(idToken)
            updateUser(res.data.user)
            return res.data.user
        } catch (err) {
            const msg = err.response?.data?.message || 'Linking Google account failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [updateUser])

    /**
     * Link wallet address to existing user session
     */
    const linkWalletAddress = useCallback(async (walletAddress, signature, message) => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await authAPI.linkWallet({ walletAddress, signature, message })
            updateUser(res.data.user)
            return res.data.user
        } catch (err) {
            const msg = err.response?.data?.message || 'Linking MetaMask wallet failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [updateUser])

    const unlinkWalletAddress = useCallback(async () => {
        setLoading(true)
        setAuthError(null)
        try {
            await authAPI.unlinkWallet()
            updateUser({ walletAddress: undefined })
        } catch (err) {
            const msg = err.response?.data?.message || 'Unlinking MetaMask wallet failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [updateUser])

    /**
     * Authenticate with wallet address
     */
    const loginWithWallet = useCallback(async (walletAddress, signature, message) => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await authAPI.walletAuth({ walletAddress, signature, message })
            saveAuth(res.data.user, res.data.token)
            return res.data.user
        } catch (err) {
            const msg = err.response?.data?.message || 'Wallet auth failed'
            setAuthError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }, [saveAuth])

    const logout = useCallback(() => {
        clearAuth()
    }, [clearAuth])

    const value = {
        user,
        token,
        loading,
        authError,
        isAuthenticated,
        showWalletOnboarding,
        setShowWalletOnboarding,
        login,
        register,
        loginWithGoogle,
        loginWithWallet,
        linkGoogleAccount,
        linkWalletAddress,
        unlinkWalletAddress,
        logout,
        updateUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

export default AuthContext
