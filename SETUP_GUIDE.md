# 🚀 EpicMint Full Stack Setup Guide

## Project Status

✅ **Frontend**: Fully operational on http://localhost:3002
⚠️ **Backend**: Fixed and ready to run on http://localhost:5000

---

## 🔧 Backend Setup (Fixed ESM Issues)

### What Was Fixed
- ✅ Converted from ES Modules to CommonJS
- ✅ Removed nodemon dependency (using plain Node.js)
- ✅ Added built-in API routes
- ✅ Implemented CORS configuration
- ✅ Set up error handling middleware

### Start Backend

```bash
cd backend
npm run dev
# or
npm start
```

The backend will start on **http://localhost:5000**

### Available Endpoints

**Health Check**
```
GET http://localhost:5000/health
```

**NFT Management**
```
GET  http://localhost:5000/api/nfts          # List all NFTs
POST http://localhost:5000/api/nfts          # Create NFT
```

**Submissions**
```
POST http://localhost:5000/api/submissions    # Create submission
GET  http://localhost:5000/api/submissions    # List submissions
```

**AI Generation**
```
POST http://localhost:5000/api/ai/generate    # Generate content with AI
```

---

## 🌐 Frontend Setup

### Environment Variables

Update `.env` file with your credentials:

```env
# Backend
VITE_API_URL=http://localhost:5000

# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# Web3 / Blockchain
VITE_CHAIN_ID=11155111
VITE_CONTRACT_ADDRESS=0x...
VITE_INFURA_API_KEY=your_infura_key

# IPFS
VITE_PINATA_API_KEY=your_pinata_key
VITE_PINATA_SECRET_KEY=your_secret

# AI
VITE_GOOGLE_GENAI_API_KEY=your_genai_key
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:3002**

---

## 🔗 API Integration

The frontend includes a pre-configured Axios client:

```javascript
import { apiClient } from '@/lib'

// GET request
const nfts = await apiClient.get('/nfts')

// POST request
await apiClient.post('/nfts', {
  title: 'My NFT',
  description: 'NFT Description',
  price: '1.5'
})
```

---

## 🔐 Web3 / Blockchain Integration

Connect to MetaMask and interact with smart contracts:

```javascript
import { web3 } from '@/lib'

// Connect wallet
const account = await web3.connectWallet()

// Get network info
const info = await web3.getNetworkInfo()

// Mint NFT (requires contract)
const receipt = await web3.mintNFT('ipfs://...')

// Get NFT balance
const balance = await web3.getNFTBalance()

// Listen to events
web3.onTransfer((event) => {
  console.log('NFT transferred:', event)
})
```

### WalletConnect Component

```jsx
import { WalletConnect } from '@/components'

function App() {
  return (
    <WalletConnect onConnected={(account) => {
      console.log('Wallet connected:', account)
    }} />
  )
}
```

---

## 🔥 Firebase Integration

### Authentication

```javascript
import { auth, logout, onAuthChange } from '@/lib/firebase'

// Listen to auth changes
onAuthChange((user) => {
  if (user) {
    console.log('User logged in:', user.email)
  } else {
    console.log('User logged out')
  }
})

// Logout
await logout()
```

### Firestore Database

```javascript
import {
  createNFT,
  getNFTs,
  getNFTById,
  getNFTsByCreator,
  updateNFT
} from '@/lib/firebase'

// Create NFT
const nftId = await createNFT({
  title: 'My NFT',
  description: 'Description',
  price: '1.5',
  creatorId: 'user123'
})

// Get all NFTs
const nfts = await getNFTs()

// Get NFT by ID
const nft = await getNFTById(nftId)

// Get creator's NFTs
const creatorNFTs = await getNFTsByCreator('user123')

// Update NFT
await updateNFT(nftId, { price: '2.0' })
```

### Storage (File Upload)

```javascript
import { uploadAndGetURL } from '@/lib/firebase'

// Upload file and get URL
const imageURL = await uploadAndGetURL(
  file,
  `nfts/${nftId}/image.png`
)
```

---

## 🧪 Testing

### Run Full Stack Tests

```bash
# Test backend health and API endpoints
curl http://localhost:5000/health

# Test NFTs endpoint
curl http://localhost:5000/api/nfts

# Test submission creation
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","message":"test"}'
```

### Test Files

- `frontend/src/__tests__/api.test.js` - API client tests
- `frontend/src/__tests__/components.test.js` - Component tests
- `backend/__tests__/api.test.js` - Backend API tests

---

## 🚀 Running Full Stack

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3002
```

### Terminal 3: Optional - Monitor Logs
```bash
# Can monitor both services
tail -f backend/logs/*
tail -f frontend/logs/*
```

---

## 📋 Complete Feature List

### Frontend Features
✅ React 18 + Vite
✅ Bootstrap 5 Responsive Design
✅ React Router v6 Navigation
✅ Axios API Client with Interceptors
✅ Custom Hooks (useLocalStorage, useAsync)
✅ Reusable Components
✅ Firebase Integration
✅ Web3/Wallet Connection
✅ Form Validation
✅ Error Handling

### Backend Features
✅ Express.js Server
✅ CORS Configuration
✅ CommonJS Module System
✅ Health Check Endpoint
✅ NFT Management API
✅ Submission Handler
✅ Error Middleware
✅ Ready for Database Integration

### Pages
- **Home** - Hero section with features
- **Marketplace** - NFT grid with filters
- **Create** - NFT creation form

### Components
- Navigation (with wallet connect)
- Footer
- WalletConnect
- Card, Button, Badge, Modal
- Loading, ErrorBoundary

---

## 🔄 Data Flow

```
User Interface (React)
        ↓
    [Vite Dev Server]
        ↓
    Axios Client
        ↓
    [Express Backend] ← → [Firebase/Database]
        ↓
    Web3/Smart Contracts
        ↓
    Blockchain
```

---

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### CORS Issues
- Backend has `origin: "*"` configured
- Update if needed in `backend/src/server.js`

### Firebase Config
- Add credentials to `.env` file
- Check Firebase project settings
- Ensure rules allow read/write

### Web3 Connection
- Install MetaMask extension
- Set correct network (Sepolia by default)
- Update `VITE_CONTRACT_ADDRESS` in `.env`

---

## 📚 Documentation Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [Express.js Docs](https://expressjs.com/)
- [Firebase Docs](https://firebase.google.com/docs/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Web3 Integration Guide](./blockchain/INTEGRATION_GUIDE.md)

---

## 🎯 Next Steps

1. **Connect to Real Database**
   - Update Firebase rules
   - Create database collections
   - Set up storage buckets

2. **Deploy Smart Contract**
   - Complete contract implementation
   - Deploy to testnet (Sepolia)
   - Update contract address

3. **Complete Backend APIs**
   - Add database operations
   - Implement authentication
   - Add file upload handling

4. **Add Advanced Features**
   - NFT marketplace transactions
   - User profiles
   - Search and filtering
   - Notifications

---

## 📞 Support

For issues or questions:
- Check the logs in both terminals
- Review error messages
- Ensure all services are running
- Verify environment variables

---

**Happy Building! 🚀**
