# 🎨 EpicMint — NFT Marketplace

<p align="center">
  <img src="./EpicMint.png" alt="EpicMint Banner" width="100%" />
</p>

> A full-stack, production-ready NFT marketplace built on Ethereum (Sepolia testnet). Create, mint, buy, and sell NFTs with AI-powered metadata generation, IPFS storage via Pinata, Firebase authentication, and a Node.js/MongoDB backend API.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Smart Contract](#-smart-contract)
- [Scripts](#-scripts)
- [Deployment](#-deployment)

---

## 🌟 Overview

EpicMint is a three-tier Web3 application:

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | User interface, wallet connection, NFT browsing |
| **Backend** | Node.js + Express + MongoDB | REST API, auth, file uploads, AI integration |
| **Blockchain** | Solidity + Hardhat | ERC-721 smart contract, Sepolia testnet |

Key features:
- 🔐 Firebase Google OAuth + JWT authentication
- 🤖 AI-generated NFT descriptions via Google Gemini
- 📦 Decentralized media storage on IPFS (Pinata)
- 🦊 MetaMask wallet integration with ethers.js v6
- 🛡️ Rate limiting, Helmet security headers, CORS whitelisting
- 📸 Server-side image processing with Sharp + Multer

---

## 🛠 Tech Stack

### Frontend
| Package | Version | Role |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.4 | Dev server & bundler |
| React Router DOM | 6.28 | Client-side routing |
| ethers.js | 6.15 | Blockchain/wallet interaction |
| axios | 1.7 | HTTP client |
| Bootstrap | 5.3 | Base CSS utilities |

### Backend
| Package | Version | Role |
|---|---|---|
| Express | 4.19 | HTTP server & routing |
| Mongoose | 8.13 | MongoDB ODM |
| jsonwebtoken | 9.0 | JWT signing/verification |
| bcryptjs | 2.4 | Password hashing |
| google-auth-library | 10.9 | Firebase token verification |
| @google/generative-ai | 0.24 | Gemini AI integration |
| multer + sharp | latest | File upload & image processing |
| Helmet + express-rate-limit | latest | Security hardening |

### Blockchain
| Package | Version | Role |
|---|---|---|
| Hardhat | 2.17 | Smart contract toolchain |
| @openzeppelin/contracts | 5.0 | ERC-721 base implementation |
| ethers.js | 6.8 | Contract interaction |
| solidity-coverage | 0.8 | Test coverage |

---

## 📁 Project Structure

```
epicmint-main/
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AuthModal.jsx       # Login / Register modal
│   │   │   ├── Navigation.jsx      # Top nav bar
│   │   │   ├── NFTCard.jsx         # NFT grid card
│   │   │   ├── WalletConnect.jsx   # MetaMask connector
│   │   │   ├── WalletOnboardingModal.jsx
│   │   │   ├── Toast.jsx           # Notification toasts
│   │   │   ├── SkeletonCard.jsx    # Loading skeleton
│   │   │   ├── Modal.jsx           # Generic modal wrapper
│   │   │   ├── Footer.jsx
│   │   │   ├── SEO.jsx             # Meta tag injection
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Marketplace.jsx     # NFT browsing & filtering
│   │   │   ├── Create.jsx          # NFT minting flow
│   │   │   ├── NFTDetail.jsx       # Individual NFT view
│   │   │   ├── Profile.jsx         # User profile & portfolio
│   │   │   ├── Blog.jsx / BlogDetail.jsx
│   │   │   ├── Documentation.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Support.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── CookiePolicy.jsx
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility helpers
│   │   ├── App.jsx             # Root router & layout
│   │   └── main.jsx            # Entry point
│   ├── public/
│   ├── .env.example
│   └── vite.config.js
│
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/        # Route handler logic
│   │   │   ├── authController.js       # Login, register, Google OAuth
│   │   │   ├── nftController.js        # CRUD for NFTs
│   │   │   ├── aiController.js         # Gemini AI metadata generation
│   │   │   ├── uploadController.js     # Multer + Pinata upload
│   │   │   ├── commentController.js    # NFT comments
│   │   │   ├── transactionController.js# On-chain transaction records
│   │   │   ├── submissionController.js # NFT submission queue
│   │   │   └── supportController.js    # Support ticket handling
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification middleware
│   │   │   └── errorHandler.js     # Global error + 404 handler
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── NFT.js
│   │   │   ├── Comment.js
│   │   │   ├── Transaction.js
│   │   │   ├── Submission.js
│   │   │   └── SupportTicket.js
│   │   ├── routes/             # Express route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── nftRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   ├── submissionRoutes.js
│   │   │   └── supportRoutes.js
│   │   ├── firebase.js         # Firebase Admin SDK init
│   │   └── server.js           # Express app bootstrap
│   ├── uploads/                # Local file upload storage
│   ├── .env.example
│   └── package.json
│
└── blockchain/                 # Hardhat smart contract workspace
    ├── contracts/
    │   └── EpicMintNFT.sol     # ERC-721 NFT contract
    ├── artifacts/              # Compiled contract ABIs
    ├── cache/                  # Hardhat build cache
    ├── examples/               # Interaction scripts
    ├── ipfs/                   # IPFS upload helpers
    ├── nft/                    # NFT minting scripts
    ├── wallet/                 # Wallet utilities
    ├── web3/                   # Web3 interaction helpers
    ├── hardhat.config.js
    └── package.json
```

---

## ✅ Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (Atlas cloud URI recommended)
- **MetaMask** browser extension
- Accounts / API keys for:
  - [Firebase](https://console.firebase.google.com/) — Authentication
  - [Pinata](https://app.pinata.cloud/) — IPFS storage
  - [Google AI Studio](https://aistudio.google.com/) — Gemini API key
  - [Infura](https://infura.io/) or Alchemy — Ethereum RPC

---

## 🔑 Environment Variables

### Backend — `backend/.env`

Copy `backend/.env.example` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/epicmint

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Pinata (IPFS)
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/<your_key>
PRIVATE_KEY=your_deployer_wallet_private_key
CONTRACT_ADDRESS=0xYourDeployedContractAddress
CHAIN_ID=11155111

# CORS — frontend origin(s), comma-separated
FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

Copy `frontend/.env.example` and fill in your values:

```env
# Backend API
VITE_API_URL=http://localhost:5000

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Web3
VITE_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_INFURA_API_KEY=

# IPFS / Pinata
VITE_PINATA_API_KEY=
VITE_PINATA_SECRET_KEY=
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Google Gemini AI
VITE_GOOGLE_GENAI_API_KEY=

# App
VITE_APP_URL=http://localhost:5173
VITE_ENV=development
```

---

## 🚀 Getting Started

Clone the repository and install dependencies for each workspace independently.

### 1. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# Blockchain (optional — only needed for contract work)
cd ../blockchain && npm install
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Fill in values as described above
```

### 3. Start the development servers

Open two terminal windows:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# Listening on http://localhost:5000
# Health check: http://localhost:5000/health
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# Listening on http://localhost:5173
```

---

## 📡 API Reference

Base URL: `http://localhost:5000`

All protected routes require the `Authorization: Bearer <jwt_token>` header.

### Auth — `/api/auth`
> Rate limited: 20 requests / 15 min

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register with email & password |
| `POST` | `/api/auth/login` | ❌ | Login with email & password |
| `POST` | `/api/auth/google` | ❌ | Firebase Google OAuth sign-in |
| `GET` | `/api/auth/me` | ✅ | Get current authenticated user |
| `PUT` | `/api/auth/profile` | ✅ | Update user profile |

### NFTs — `/api/nfts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/nfts` | ❌ | List all NFTs (paginated, filterable) |
| `GET` | `/api/nfts/:id` | ❌ | Get single NFT details |
| `POST` | `/api/nfts` | ✅ | Create / mint a new NFT |
| `PUT` | `/api/nfts/:id` | ✅ | Update NFT metadata |
| `DELETE` | `/api/nfts/:id` | ✅ | Delete an NFT |

### Uploads — `/api/uploads`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/uploads` | ✅ | Upload image to IPFS via Pinata |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/generate` | ✅ | Generate NFT metadata via Gemini |

### Comments — `/api/comments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/comments/:nftId` | ❌ | Get comments for an NFT |
| `POST` | `/api/comments` | ✅ | Post a comment on an NFT |

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/transactions` | ✅ | Get user's transaction history |
| `POST` | `/api/transactions` | ✅ | Record a new on-chain transaction |

### Submissions — `/api/submissions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/submissions` | ✅ | Submit NFT for review |
| `GET` | `/api/submissions` | ✅ | Get submission status |

### Support — `/api/support`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/support` | ✅ | Create a support ticket |
| `GET` | `/api/support` | ✅ | List user's support tickets |

### Health Check

```
GET /health
→ { status, database, environment, version, timestamp }
```

---

## 📜 Smart Contract

**Contract:** `EpicMintNFT.sol` — ERC-721 NFT on Ethereum Sepolia

| Item | Value |
|---|---|
| Standard | ERC-721 (OpenZeppelin v5) |
| Network | Sepolia Testnet (chainId: 11155111) |
| Toolchain | Hardhat |

### Compile & Deploy

```bash
cd blockchain

# Compile Solidity contracts
npm run compile

# Deploy to local Hardhat network
npm run deploy:local

# Deploy to Sepolia testnet
# (Requires RPC_URL and PRIVATE_KEY in environment)
npx hardhat run nft/deploy.js --network sepolia

# Run contract tests
npm test

# Generate coverage report
npm run coverage
```

After deployment, copy the contract address into both `.env` files:
- `backend/.env` → `CONTRACT_ADDRESS`
- `frontend/.env` → `VITE_CONTRACT_ADDRESS`

---

## 🧰 Scripts

### Frontend
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix ESLint errors
npm run format       # Prettier format all src files
npm run format:check # Check formatting without writing
```

### Backend
```bash
npm run dev          # Start with nodemon (hot reload)
npm start            # Start server (production)
```

### Blockchain
```bash
npm run compile      # Compile Solidity contracts
npm test             # Run Hardhat test suite
npm run deploy:local # Deploy to local Hardhat network
npm run coverage     # Solidity test coverage
npm run lint         # Solhint linting for .sol files
```

---

## 🌐 Deployment

### Frontend — Vercel / Firebase Hosting

```bash
cd frontend
npm run build
# Upload the dist/ directory to your hosting provider
```

Set all `VITE_*` environment variables in your hosting dashboard before building.

### Backend — Railway / Render / VPS

Set all environment variables on your host and use the start command:

```bash
node src/server.js
```

Update `FRONTEND_URL` to your production frontend URL so CORS allows the connection:

```env
FRONTEND_URL=https://epicmint.vercel.app
```

### Multi-Origin CORS

The backend supports comma-separated frontend origins:

```env
FRONTEND_URL=https://epicmint.vercel.app,https://epicmint-staging.vercel.app
```

---

## 📄 License

MIT
