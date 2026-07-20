export const BLOG_POSTS = [
    {
        id: '1',
        slug: 'mastering-nft-minting-on-epicmint',
        title: 'Mastering NFT Minting: A Complete Guide to Launching Digital Collections',
        coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-18',
        category: 'Guides',
        readTime: '5 min read',
        author: {
            name: 'Alex Rivera',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'Lead Blockchain Architect'
        },
        excerpt: 'Discover the essential strategies for minting high-value NFTs, optimizing Pinata IPFS metadata, and setting creator royalties.',
        content: `
# Mastering NFT Minting: A Complete Guide to Launching Digital Collections

Minting an NFT is the foundational step of establishing digital ownership on the Ethereum blockchain. On EpicMint, the process is streamlined to empower digital artists, photographers, and developers with zero-friction tools.

## What Happens During Minting?

When you click **Mint NFT** on EpicMint, two key processes occur in sequence:

1. **Decentralized Storage (Pinata IPFS)**: Your high-resolution digital artwork and JSON metadata standard (ERC-721 format) are pinned to IPFS via Pinata. This ensures that your media file will never suffer from dead links or centralized server outages.
2. **On-Chain Smart Contract Execution**: An ERC-721 smart contract execution triggers on the Sepolia Testnet, assigning a unique \`tokenId\` to your connected Web3 wallet.

## Setting Up Royalties & Secondary Sales

EpicMint natively supports creator royalties (up to 10%). Every time a collector resells your NFT on secondary marketplaces, the smart contract automatically transfers your royalty percentage directly into your connected MetaMask wallet.

### Pro Tips for Creators:
- Use clear, descriptive titles and high-quality traits.
- Ensure your artwork file size is compressed below 10 MB for fast loading.
- Verify your contract deployer address to establish authentic origin.
`
    },
    {
        id: '2',
        slug: 'understanding-pinata-ipfs-storage',
        title: 'Why IPFS & Pinata are Crucial for Permanent NFT Metadata',
        coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-14',
        category: 'Technology',
        readTime: '6 min read',
        author: {
            name: 'Elena Rostova',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            role: 'IPFS Systems Specialist'
        },
        excerpt: 'Learn how content addressing (CIDs) prevents media tampering and guarantees immutable asset storage for Web3 collections.',
        content: `
# Why IPFS & Pinata are Crucial for Permanent NFT Metadata

Traditional web applications store images on centralized servers. If a server shuts down or a domain expires, your digital collectible turns into a broken HTTP 404 image link.

## Content-Addressed Storage (CID)

Unlike traditional URLs that point to a location (\`https://example.com/image.jpg\`), InterPlanetary File System (IPFS) uses **Content Identifiers (CIDs)**. A CID is a cryptographic hash calculated directly from the contents of the file itself.

If even a single pixel in an image is modified, its CID completely changes. This guarantees:
- **Immutability**: The image associated with your NFT can never be altered or replaced.
- **Permanent Availability**: High-speed dedicated Pinata gateways deliver sub-second media streaming globally.

## How EpicMint Implements Pinata

1. When you upload a file, EpicMint compresses high-res images automatically.
2. The file is pinned to dual Pinata IPFS nodes (FRA1 & NYC1 regions).
3. An ERC-721 compliant JSON metadata document is created and pinned to generate a unique \`tokenURI\`.
`
    },
    {
        id: '3',
        slug: 'openzeppelin-v5-smart-contracts-explained',
        title: 'Inside EpicMint Smart Contracts: OpenZeppelin v5 & EVM Security',
        coverImage: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-10',
        category: 'Smart Contracts',
        readTime: '7 min read',
        author: {
            name: 'Marcus Vance',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            role: 'Smart Contract Auditor'
        },
        excerpt: 'An in-depth breakdown of Solidity 0.8.24, Cancun EVM target, and ERC-721 URI Storage integration.',
        content: `
# Inside EpicMint Smart Contracts: OpenZeppelin v5 & EVM Security

Security and gas efficiency are at the core of EpicMint's smart contract architecture. Built using OpenZeppelin v5 standards and compiled on Solidity 0.8.24 (\`cancun\` EVM target), our contracts offer battle-tested protection against reentrancy and unauthorized minting.

## Key Contract Features

- **ERC721URIStorage**: Provides granular per-token URI mapping for IPFS metadata.
- **Ownable & Creator Verification**: Enforces contract owner privileges and maintains an on-chain registry of verified creators.
- **Native ETH Transfers**: Marketplace sales execute direct wallet-to-wallet atomic ETH transactions with 0% hidden intermediary lockup.

## Contract Address Verification

The official EpicMint NFT contract on Sepolia Testnet is deployed at:
\`\`\`
0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
\`\`\`
`
    },
    {
        id: '4',
        slug: 'ai-nft-metadata-generator-epicmint',
        title: 'Boosting Creator Productivity with Gemini AI NFT Metadata Generation',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        date: '2026-07-05',
        category: 'AI & Tools',
        readTime: '4 min read',
        author: {
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            role: 'AI Product Lead'
        },
        excerpt: 'How EpicMint leverages Google Gemini AI to auto-populate title, description, tags, and trait attributes in seconds.',
        content: `
# Boosting Creator Productivity with Gemini AI NFT Metadata Generation

Writing compelling descriptions and structuring traits for dozens of digital assets can be time-consuming. EpicMint integrates Google Gemini AI directly into the creation suite to streamline metadata generation.

## How the AI Enhancer Works

1. Enter a brief concept (e.g., *"Cyberpunk warrior in a neon rain city"*).
2. Click **✨ Generate Details**.
3. Gemini AI instantly generates:
   - Catchy, SEO-optimized Title
   - Rich, engaging Story & Description
   - Category tags and structured Rarity Trait attributes
`
    }
]

export const BLOG_CATEGORIES = ['All', 'Guides', 'Technology', 'Smart Contracts', 'AI & Tools']
