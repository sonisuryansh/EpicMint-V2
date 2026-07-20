import { ethers } from 'ethers'

// ABI definitions matching EpicMintNFT smart contract
const NFT_ABI = [
    'function mintNFT(address to, string memory metadataURI, address royaltyReceiver, uint96 royaltyFee) external returns (uint256)',
    'function verifyCreator(address creator) external',
    'function revokeCreator(address creator) external',
    'function isVerifiedCreator(address creator) external view returns (bool)',
    'function setRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external',
    'function resetRoyalty(uint256 tokenId) external',
    'function royaltyInfo(uint256 tokenId, uint256 salePrice) public view returns (address receiver, uint256 amount)',
    'function contractURI() external view returns (string memory)',
    'function setContractURI(string memory newURI) external',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'function balanceOf(address owner) public view returns (uint256)',
    'function safeTransferFrom(address from, address to, uint256 tokenId) external',
    'function approve(address to, uint256 tokenId) external',
    'function setApprovalForAll(address operator, bool approved) external',
    'function isApprovedForAll(address owner, address operator) external view returns (bool)',
    'function getApproved(uint256 tokenId) external view returns (address)',
    'function burn(uint256 tokenId) external',
    'function pause() external',
    'function unpause() external',
    'function paused() external view returns (bool)',
    'function owner() external view returns (address)',
    'event NFTMinted(uint256 indexed tokenId, address indexed creator, address indexed owner, string tokenURI)',
    'event CreatorVerified(address indexed creator)',
    'event CreatorRevoked(address indexed creator)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
]

// ABI definitions matching EpicMintMarketplace smart contract
const MARKETPLACE_ABI = [
    'function createListing(uint256 tokenId, address nftContract, uint256 price) external returns (bytes32)',
    'function buyItem(bytes32 listingId) external payable',
    'function cancelListing(bytes32 listingId) external',
    'function createAuction(uint256 tokenId, address nftContract, uint256 startingPrice, uint256 duration) external returns (bytes32)',
    'function placeBid(bytes32 auctionId) external payable',
    'function endAuction(bytes32 auctionId) external',
    'function makeOffer(uint256 tokenId, address nftContract, uint256 expiration) external payable returns (bytes32)',
    'function acceptOffer(bytes32 offerId, uint256 offerIndex) external',
    'function withdraw() external',
    'function getListing(bytes32 listingId) external view returns (tuple(uint256 tokenId, address nftContract, address seller, uint256 price, uint256 listingTime, bool active))',
    'function getAuction(bytes32 auctionId) external view returns (tuple(uint256 tokenId, address nftContract, address seller, uint256 startingPrice, uint256 currentBid, address currentBidder, uint256 startTime, uint256 endTime, bool active, bool ended))',
    'function platformFeePercent() external view returns (uint256)',
    'event ItemListed(bytes32 indexed listingId, uint256 indexed tokenId, address indexed nftContract, address seller, uint256 price)',
    'event ItemSold(bytes32 indexed listingId, uint256 indexed tokenId, address indexed nftContract, address seller, address buyer, uint256 price)',
    'event AuctionCreated(bytes32 indexed auctionId, uint256 indexed tokenId, address indexed nftContract, address seller, uint256 startingPrice, uint256 duration)',
    'event BidPlaced(bytes32 indexed auctionId, address indexed bidder, uint256 amount)',
]

class Web3Service {
    constructor() {
        this.provider = null
        this.signer = null
        this.nftContract = null
        this.marketplaceContract = null
        this.account = null
        this.chainId = null
        this._listeners = []
    }

    get isConnected() { return !!this.account }

    // Connect to injected MetaMask browser wallet
    async connectWallet() {
        if (!window.ethereum) {
            throw new Error('MetaMask or Web3 wallet not found. Please install MetaMask.')
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        this.account = accounts[0]
        this.provider = new ethers.BrowserProvider(window.ethereum)
        this.signer = await this.provider.getSigner()

        const network = await this.provider.getNetwork()
        this.chainId = Number(network.chainId)

        this._initContracts()
        this._setupEventListeners()

        return this.account
    }

    // Auto-reconnect if wallet session was previously approved
    async checkConnection() {
        if (!window.ethereum) return null
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
            this.account = accounts[0]
            this.provider = new ethers.BrowserProvider(window.ethereum)
            this.signer = await this.provider.getSigner()
            const network = await this.provider.getNetwork()
            this.chainId = Number(network.chainId)
            this._initContracts()
            this._setupEventListeners()
            return this.account
        }
        return null
    }

    // Initialize smart contract instances with signer
    _initContracts() {
        const nftAddress = import.meta.env.VITE_CONTRACT_ADDRESS
        const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS

        if (nftAddress && nftAddress !== 'your_contract_address') {
            this.nftContract = new ethers.Contract(nftAddress, NFT_ABI, this.signer)
        }

        if (marketplaceAddress && marketplaceAddress !== 'your_marketplace_address') {
            this.marketplaceContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, this.signer)
        }
    }

    // Bind event listeners for account and chain switching
    _setupEventListeners() {
        if (!window.ethereum) return

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                this.disconnect()
            } else {
                this.account = accounts[0]
            }
            window.dispatchEvent(new CustomEvent('wallet:accountsChanged', { detail: accounts }))
        }

        const handleChainChanged = (chainId) => {
            this.chainId = parseInt(chainId, 16)
            window.dispatchEvent(new CustomEvent('wallet:chainChanged', { detail: this.chainId }))
            this.provider = new ethers.BrowserProvider(window.ethereum)
            this.provider.getSigner().then(s => { this.signer = s; this._initContracts() })
        }

        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)

        this._listeners = [
            { event: 'accountsChanged', handler: handleAccountsChanged },
            { event: 'chainChanged', handler: handleChainChanged },
        ]
    }

    // Disconnect active wallet session and reset state
    async disconnect() {
        this._listeners.forEach(({ event, handler }) => {
            window.ethereum?.removeListener(event, handler)
        })
        if (window.ethereum && window.ethereum.request) {
            try {
                await window.ethereum.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }],
                })
            } catch (err) {
                console.warn('Revoke permissions not supported or rejected:', err.message)
            }
        }
        this.provider = null
        this.signer = null
        this.nftContract = null
        this.marketplaceContract = null
        this.account = null
        this.chainId = null
        this._listeners = []
        window.dispatchEvent(new CustomEvent('wallet:accountsChanged', { detail: [] }))
    }

    // Get wallet ETH balance and network information
    async getNetworkInfo() {
        if (!this.provider) throw new Error('Wallet not connected')
        const [network, balance] = await Promise.all([
            this.provider.getNetwork(),
            this.provider.getBalance(this.account),
        ])
        return {
            chainId: Number(network.chainId),
            name: network.name,
            balance: ethers.formatEther(balance),
            balanceFormatted: parseFloat(ethers.formatEther(balance)).toFixed(4) + ' ETH',
        }
    }

    // Sign message with connected wallet private key
    async signMessage(message) {
        if (!this.signer) throw new Error('Wallet not connected')
        return this.signer.signMessage(message)
    }

    // Mint new ERC-721 token on smart contract
    async mintNFT(tokenURI, royaltyRecipient, royaltyPercentage = 250) {
        if (!this.nftContract) {
            throw new Error('NFT contract not initialized. Check VITE_CONTRACT_ADDRESS.')
        }

        try {
            const isVerified = await this.nftContract.isVerifiedCreator(this.account)
            if (!isVerified) {
                const owner = await this.nftContract.owner()
                if (owner.toLowerCase() === this.account.toLowerCase()) {
                    const vTx = await this.nftContract.verifyCreator(this.account)
                    await vTx.wait()
                } else {
                    throw new Error('Your wallet is not verified as a creator on this contract. The contract owner must verify your address using verifyCreator().')
                }
            }
        } catch (vErr) {
            if (vErr.message.includes('not verified')) throw vErr
        }

        const tx = await this.nftContract.mintNFT(
            this.account,
            tokenURI,
            royaltyRecipient || this.account,
            royaltyPercentage
        )
        const receipt = await tx.wait()
        const mintEvent = receipt.logs
            .map(log => { try { return this.nftContract.interface.parseLog(log) } catch { return null } })
            .find(e => e?.name === 'NFTMinted')
        const tokenId = mintEvent?.args?.tokenId?.toString() || null
        return { tokenId, txHash: receipt.hash, receipt }
    }

    // Transfer NFT token to target address
    async transferNFT(contractAddress, from, to, tokenId) {
        if (!this.signer) throw new Error('Wallet not connected')
        const contract = new ethers.Contract(contractAddress, NFT_ABI, this.signer)
        const tx = await contract.safeTransferFrom(from, to, tokenId)
        const receipt = await tx.wait()
        return receipt
    }

    // List NFT for sale on marketplace
    async listNFT(tokenId, priceInEth) {
        if (!this.nftContract) throw new Error('Contract not initialized')
        const priceWei = ethers.parseEther(priceInEth.toString())
        const tx = await this.nftContract.listNFT(tokenId, priceWei)
        const receipt = await tx.wait()
        return { txHash: receipt.hash, receipt }
    }

    // Purchase NFT with ETH payment via MetaMask
    async buyNFT(tokenId, priceInEth, sellerAddress) {
        if (!this.signer) throw new Error('MetaMask wallet not connected')
        const priceWei = ethers.parseEther((priceInEth || 0).toString())

        if (sellerAddress && sellerAddress.startsWith('0x') && sellerAddress.length === 42) {
            const tx = await this.signer.sendTransaction({
                to: sellerAddress,
                value: priceWei,
            })
            const receipt = await tx.wait()
            return { txHash: receipt.hash, receipt }
        }

        if (!this.nftContract) throw new Error('NFT Contract not initialized')
        const tx = await this.nftContract.buyNFT(tokenId, { value: priceWei })
        const receipt = await tx.wait()
        return { txHash: receipt.hash, receipt }
    }

    // Unlist NFT item from sale
    async unlistNFT(tokenId) {
        if (!this.nftContract) throw new Error('Contract not initialized')
        const tx = await this.nftContract.unlistNFT(tokenId)
        const receipt = await tx.wait()
        return { txHash: receipt.hash, receipt }
    }

    // Fetch token balance for address
    async getNFTBalance(address) {
        if (!this.nftContract) return '0'
        const balance = await this.nftContract.balanceOf(address || this.account)
        return balance.toString()
    }

    // Get current owner of token ID
    async getTokenOwner(tokenId) {
        if (!this.nftContract) throw new Error('Contract not initialized')
        return this.nftContract.ownerOf(tokenId)
    }

    // Get list of token IDs available for sale
    async getTokensForSale() {
        if (!this.nftContract) return []
        const tokenIds = await this.nftContract.getTokensForSale()
        return tokenIds.map(id => id.toString())
    }

    // Get list of token IDs owned by address
    async getTokensByOwner(address) {
        if (!this.nftContract) return []
        const tokenIds = await this.nftContract.getTokensByOwner(address || this.account)
        return tokenIds.map(id => id.toString())
    }

    // Check if contract is initialized
    get isContractReady() {
        return !!this.nftContract
    }

    // Format address to shortened view string
    getShortAddress(address) {
        const addr = address || this.account
        if (!addr) return ''
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    // Prompt wallet network switch to Sepolia testnet
    async switchToSepolia() {
        if (!window.ethereum) throw new Error('No wallet provider')
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
            })
        } catch (err) {
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia Testnet',
                        rpcUrls: ['https://sepolia.infura.io/v3/'],
                        nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                        blockExplorerUrls: ['https://sepolia.etherscan.io'],
                    }],
                })
            } else throw err
        }
    }
}

// Format raw Web3 and RPC errors into user friendly message
export const formatWeb3Error = (err) => {
    if (!err) return 'An unexpected error occurred.'
    const msg = typeof err === 'string' ? err : (err.message || err.reason || '')
    const code = err.code || ''

    if (code === 'INSUFFICIENT_FUNDS' || msg.includes('insufficient funds') || msg.includes('have 0 want')) {
        return 'Insufficient Sepolia ETH balance in your MetaMask wallet to complete this purchase (Price + Gas fee). Please get free Sepolia testnet ETH from a faucet or select a lower-priced NFT.'
    }
    if (code === 'ACTION_REJECTED' || msg.includes('user rejected') || msg.includes('User denied')) {
        return 'Transaction was cancelled in MetaMask.'
    }
    if (msg.includes('Creator not verified')) {
        return 'Your wallet is not verified as a creator on this contract. The contract owner must verify your address using verifyCreator().'
    }
    if (msg.includes('network') || code === 'NETWORK_ERROR') {
        return 'Blockchain network error. Please ensure MetaMask is connected to Sepolia Testnet.'
    }
    if (msg.length > 150) {
        return msg.split('\n')[0].slice(0, 150) + '...'
    }
    return msg
}

// Export singleton service instance
const web3Service = new Web3Service()
export default web3Service
