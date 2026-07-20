# EpicMint V2

EpicMint is an AI-assisted NFT marketplace for creators and collectors. It combines a Next.js web app, Firebase services, an Express API, and Solidity contracts to support content creation, NFT minting, and marketplace interactions.

![EpicMint hero](./lake-hero.png)

## What it includes

- AI-assisted creative content workflows powered by Google Genkit and Gemini
- Firebase authentication, Firestore data storage, and Firebase Hosting configuration
- NFT marketplace UI built with Next.js, React, Tailwind CSS, and Radix UI
- Wallet and blockchain service code for ERC-721 NFTs, royalties, listings, auctions, and offers
- IPFS/Pinata integration utilities for NFT images and metadata
- Express API service with health-check and API router mounting

## Repository layout

```text
EpicMint-V2/
├── frontend/    Next.js application and Firebase configuration
├── backend/     Express API service
├── blockchain/  Solidity contracts and Web3, wallet, NFT, and IPFS services
└── lake-hero.png
```

## Prerequisites

- Node.js 18 or later
- npm
- A Firebase project (for authentication, Firestore, and storage)
- A Google AI API key for AI features
- MetaMask or a compatible EVM wallet for blockchain features
- Optional: Pinata, Infura/Alchemy, and deployed contract addresses

## Getting started

Clone the repository and install the frontend dependencies:

```bash
git clone https://github.com/sonisuryansh/EpicMint-V2.git
cd EpicMint-V2/frontend
npm install
```

Create `frontend/.env` from the provided example and fill in your values:

```bash
copy .env.example .env
```

At minimum, configure Firebase, the Google AI key, chain ID, contract address, and any Pinata/RPC credentials you use. Environment files are intentionally ignored by Git.

Start the frontend:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Backend service

```bash
cd ../backend
npm install
npm run dev
```

The API uses port `5000` by default. Its health endpoint is available at `GET /health`.

### Blockchain workspace

```bash
cd ../blockchain
npm install
npm run compile
```

The blockchain folder contains the `EpicMintNFT` and `EpicMintMarketplace` Solidity contracts, plus TypeScript services for wallet, Web3, NFT, marketplace, and IPFS operations. Before deploying, provide network RPC URLs, contract configuration, and secure deployment credentials via environment variables. Do not use unreviewed contracts on mainnet.

## Available commands

| Area | Command | Purpose |
| --- | --- | --- |
| Frontend | `npm run dev` | Run the Next.js app with Turbopack |
| Frontend | `npm run build` | Create a production build |
| Frontend | `npm run start` | Run the production server |
| Frontend | `npm run genkit:dev` | Run the Genkit development server |
| Backend | `npm run dev` | Run the Express server with Nodemon |
| Backend | `npm start` | Run the Express server |
| Blockchain | `npm run compile` | Compile Solidity contracts with Hardhat |
| Blockchain | `npm test` | Run Hardhat tests |
| Blockchain | `npm run deploy:local` | Deploy to a local Hardhat network |

Run each command from its corresponding directory.

## Technology

- **Frontend:** Next.js 15, React 18, Tailwind CSS, Radix UI
- **Backend and data:** Node.js, Express, Firebase
- **AI:** Genkit with Google AI
- **Web3:** Solidity, OpenZeppelin, Ethers.js, Hardhat, MetaMask
- **Decentralized storage:** IPFS via Pinata

## Security notes

- Never commit `.env` files, private keys, API keys, or Firebase service credentials.
- Use a testnet such as Sepolia while developing contracts.
- Obtain a professional security audit before deploying or accepting value on a production network.

## License

No license file is currently included. Add a license before redistributing or accepting external contributions.
