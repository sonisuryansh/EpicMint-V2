# Blockchain Integration Guide

This folder contains complete blockchain integration code for NFT marketplace functionality.

## 🏗️ **Project Structure**

```
blockchain/
├── contracts/              # Smart contracts
│   ├── EpicMintNFT.sol     # Main NFT contract
│   └── EpicMintMarketplace.sol # Marketplace contract
├── web3/                   # Web3 integration
│   └── web3-service.ts     # Core Web3 service
├── nft/                    # NFT services
│   ├── nft-service.ts      # NFT operations
│   └── marketplace-service.ts # Marketplace operations
├── wallet/                 # Wallet management
│   └── wallet-manager.ts   # Wallet connection service
├── ipfs/                   # IPFS storage
│   └── ipfs-service.ts     # IPFS upload/download
├── examples/               # Usage examples
│   └── usage-examples.ts   # Complete workflows
└── README.md              # This file
```

## 🚀 **Features**

### **Smart Contracts**
- ✅ **ERC-721 NFT Contract** with marketplace integration
- ✅ **Marketplace Contract** with auctions, offers, and fixed-price sales
- ✅ **Royalty System** (EIP-2981 compatible)
- ✅ **Batch Minting** support
- ✅ **Pause/Unpause** functionality
- ✅ **Access Control** with owner privileges

### **Web3 Integration**
- ✅ **Multi-Network Support** (Ethereum, Polygon, Testnets)
- ✅ **MetaMask Integration** with auto-detection
- ✅ **Smart Contract Interaction** with gas optimization
- ✅ **Transaction Monitoring** with confirmation tracking
- ✅ **Network Switching** and validation

### **NFT Services**
- ✅ **Mint NFTs** with metadata
- ✅ **Batch Minting** for collections
- ✅ **Transfer & Burn** functionality
- ✅ **Approval Management** for marketplace
- ✅ **Royalty Configuration**

### **Marketplace Services**
- ✅ **Fixed Price Listings**
- ✅ **Auction System** with bidding
- ✅ **Offer System** for negotiations
- ✅ **Fee Calculation** and distribution
- ✅ **Withdrawal System** for sellers

### **IPFS Integration**
- ✅ **Pinata Integration** for reliable storage
- ✅ **Image & Metadata Upload**
- ✅ **Gateway Management** with fallbacks
- ✅ **Hash Validation** and URL conversion

### **Wallet Management**
- ✅ **MetaMask Connection** with event handling
- ✅ **Multi-Network Support**
- ✅ **Message Signing** (personal & typed data)
- ✅ **Balance Tracking**
- ✅ **Network Detection** and switching

## 📋 **Usage Examples**

### **1. Basic NFT Minting**
```typescript
import { mintAndListNFTExample } from './examples/usage-examples';

async function mintMyNFT() {
  const result = await mintAndListNFTExample();
  console.log('Minted NFT:', result.tokenId);
}
```

### **2. Marketplace Operations**
```typescript
import { buyNFTExample } from './examples/usage-examples';

async function buyNFT() {
  const result = await buyNFTExample('listing-id-here');
  console.log('Purchase successful:', result.txHash);
}
```

### **3. Auction Creation**
```typescript
import { auctionExample } from './examples/usage-examples';

async function createAuction() {
  const result = await auctionExample();
  console.log('Auction created:', result.auctionId);
}
```

## 🔧 **Configuration**

### **1. Environment Variables**
```env
# Pinata IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Network RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY

# Contract Addresses (after deployment)
NFT_CONTRACT_ADDRESS=0x...
MARKETPLACE_CONTRACT_ADDRESS=0x...
```

### **2. Contract Deployment**
```solidity
// Deploy NFT Contract
const nftContract = await deploy("EpicMintNFT", [
  "EpicMint NFTs",  // name
  "EPIC"           // symbol
]);

// Deploy Marketplace Contract
const marketplaceContract = await deploy("EpicMintMarketplace");
```

## 🌐 **Supported Networks**

| Network | Chain ID | Status | Purpose |
|---------|----------|--------|---------|
| Ethereum Mainnet | 1 | ✅ Production | Main deployment |
| Goerli Testnet | 5 | ✅ Testing | Development testing |
| Sepolia Testnet | 11155111 | ✅ Testing | Latest testnet |
| Polygon Mainnet | 137 | ✅ Production | Lower gas fees |

## 📚 **Core Services**

### **Web3Service**
```typescript
import { web3Service } from './web3/web3-service';

// Connect to wallet
const connection = await web3Service.connectWallet();

// Switch network
await web3Service.switchNetwork(137); // Polygon

// Send transaction
const txHash = await web3Service.sendTransaction(method, '0.1');
```

### **NFTService**
```typescript
import { nftService } from './nft/nft-service';

// Mint NFT
const tokenId = await nftService.mintNFT({
  to: address,
  metadata: nftMetadata,
  royaltyPercentage: 250 // 2.5%
});

// Get NFT details
const details = await nftService.getNFTDetails(tokenId);
```

### **MarketplaceService**
```typescript
import { marketplaceService } from './nft/marketplace-service';

// Create listing
const listingId = await marketplaceService.createListing(
  tokenId, contractAddress, '0.1'
);

// Buy item
await marketplaceService.buyItem(listingId, '0.1');
```

### **IPFSService**
```typescript
import { ipfsService } from './ipfs/ipfs-service';

// Configure Pinata
ipfsService.configure({
  apiKey: 'your_key',
  apiSecret: 'your_secret'
});

// Upload NFT with image
const result = await ipfsService.uploadNFTWithImage(
  imageFile, metadata
);
```

## 🔐 **Security Features**

- ✅ **Reentrancy Protection** on all payable functions
- ✅ **Access Control** with owner/admin roles
- ✅ **Pause Mechanism** for emergency stops
- ✅ **Input Validation** on all parameters
- ✅ **Safe Math** operations throughout
- ✅ **Event Logging** for transparency

## 🧪 **Testing**

### **Contract Testing**
```bash
# Install dependencies
npm install @openzeppelin/contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network goerli
```

### **Frontend Testing**
```typescript
// Test wallet connection
await walletManager.connect();

// Test NFT minting
await mintAndListNFTExample();

// Test marketplace operations
await buyNFTExample('listing-id');
```

## 🚨 **Important Notes**

⚠️ **This code is for REFERENCE ONLY and NOT connected to the main project**

1. **Contract Addresses**: Update contract addresses in `web3-service.ts`
2. **API Keys**: Configure Pinata API keys for IPFS uploads
3. **Network URLs**: Update RPC URLs with your Infura/Alchemy keys
4. **Gas Optimization**: Adjust gas limits based on network conditions
5. **Error Handling**: Implement proper error handling for production
6. **Security Audit**: Get contracts audited before mainnet deployment

## 📄 **License**

MIT License - Use this code as reference for your blockchain integration.

---

**Built for EpicMint NFT Marketplace** 🎨✨