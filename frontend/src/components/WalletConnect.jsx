import React, { useState, useEffect } from 'react'
import { Button, Badge, Loading } from '@/components'
import web3 from '@/lib/web3'
import './WalletConnect.css'

function WalletConnect({ onConnected }) {
    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState(null)
    const [network, setNetwork] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        checkWalletConnection()
    }, [])

    const checkWalletConnection = async () => {
        try {
            if (window.ethereum && web3.account) {
                setAccount(web3.account)
                await fetchNetworkInfo()
            }
        } catch (err) {
            console.error('Check wallet error:', err)
        }
    }

    const handleConnect = async () => {
        try {
            setLoading(true)
            setError(null)
            const account = await web3.connectWallet()
            setAccount(account)
            await fetchNetworkInfo()
            onConnected?.(account)
        } catch (err) {
            setError(err.message)
            console.error('Connection error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDisconnect = () => {
        web3.disconnect()
        setAccount(null)
        setBalance(null)
        setNetwork(null)
    }

    const fetchNetworkInfo = async () => {
        try {
            const info = await web3.getNetworkInfo()
            setBalance(info.balance)
            setNetwork(info.name)
        } catch (err) {
            console.error('Fetch network error:', err)
        }
    }

    if (loading) return <Loading />

    if (account) {
        return (
            <div className="wallet-connect-container">
                <div className="wallet-info">
                    <Badge variant="success" className="me-2">
                        Connected
                    </Badge>
                    <span className="wallet-address">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                </div>
                {balance && <div className="wallet-balance">Balance: {balance}</div>}
                {network && <div className="wallet-network">Network: {network}</div>}
                <Button variant="danger" size="sm" onClick={handleDisconnect}>
                    Disconnect
                </Button>
            </div>
        )
    }

    return (
        <div className="wallet-connect-container">
            {error && <div className="alert alert-danger">{error}</div>}
            <Button variant="primary" onClick={handleConnect} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
        </div>
    )
}

export default WalletConnect
