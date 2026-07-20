import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import web3Service from '../lib/web3'
import { useAuth } from './AuthContext'

const Web3Context = createContext(null)

export function Web3Provider({ children }) {
    const { loginWithWallet } = useAuth()
    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState(null)
    const [network, setNetwork] = useState(null)
    const [chainId, setChainId] = useState(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)

    const isConnected = !!account

    // Check wallet availability
    useEffect(() => {
        setIsInstalled(!!window.ethereum)
    }, [])

    // Auto-reconnect on page load
    useEffect(() => {
        const tryReconnect = async () => {
            try {
                const addr = await web3Service.checkConnection()
                if (addr) {
                    setAccount(addr)
                    setChainId(web3Service.chainId)
                    await fetchNetworkInfo()
                }
            } catch (err) {
                console.warn('Auto-reconnect failed:', err.message)
            }
        }
        tryReconnect()
    }, [])

    // Listen for wallet events
    useEffect(() => {
        const handleAccountsChanged = (e) => {
            const accounts = e.detail
            if (accounts.length === 0) {
                setAccount(null)
                setBalance(null)
                setNetwork(null)
            } else {
                setAccount(accounts[0])
                fetchNetworkInfo()
            }
        }

        const handleChainChanged = (e) => {
            setChainId(e.detail)
            fetchNetworkInfo()
        }

        window.addEventListener('wallet:accountsChanged', handleAccountsChanged)
        window.addEventListener('wallet:chainChanged', handleChainChanged)
        return () => {
            window.removeEventListener('wallet:accountsChanged', handleAccountsChanged)
            window.removeEventListener('wallet:chainChanged', handleChainChanged)
        }
    }, [])

    const fetchNetworkInfo = async () => {
        try {
            const info = await web3Service.getNetworkInfo()
            setBalance(info.balanceFormatted)
            setNetwork(info.name)
            setChainId(info.chainId)
        } catch (err) {
            console.warn('Fetch network info failed:', err.message)
        }
    }

    /**
     * Connect wallet and optionally authenticate with backend
     */
    const connect = useCallback(async () => {
        setIsConnecting(true)
        setError(null)
        try {
            const addr = await web3Service.connectWallet()
            setAccount(addr)
            setChainId(web3Service.chainId)
            await fetchNetworkInfo()

            // Authenticate with backend via wallet signature
            try {
                const message = `Sign in to EpicMint: ${Date.now()}`
                const signature = await web3Service.signMessage(message)
                await loginWithWallet(addr, signature, message)
            } catch (authErr) {
                // Auth failed — wallet is still connected but not backend-authenticated
                console.warn('Backend auth failed:', authErr.message)
            }

            return addr
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsConnecting(false)
        }
    }, [loginWithWallet])

    /**
     * Disconnect wallet
     */
    const disconnect = useCallback(() => {
        web3Service.disconnect()
        setAccount(null)
        setBalance(null)
        setNetwork(null)
        setChainId(null)
    }, [])

    const getShortAddress = useCallback((addr) => {
        const a = addr || account
        if (!a) return ''
        return `${a.slice(0, 6)}...${a.slice(-4)}`
    }, [account])

    const value = {
        account,
        balance,
        network,
        chainId,
        isConnected,
        isConnecting,
        isInstalled,
        error,
        connect,
        disconnect,
        getShortAddress,
        web3Service,
        isContractReady: web3Service.isContractReady,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export const useWeb3 = () => {
    const ctx = useContext(Web3Context)
    if (!ctx) throw new Error('useWeb3 must be used inside Web3Provider')
    return ctx
}

export default Web3Context
