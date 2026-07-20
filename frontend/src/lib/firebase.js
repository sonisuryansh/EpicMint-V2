import {
    initializeApp,
    getApps,
} from 'firebase/app'
import {
    getAuth,
    connectAuthEmulator,
    signInWithGoogle,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth'
import {
    getFirestore,
    connectFirestoreEmulator,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
} from 'firebase/firestore'
import {
    getStorage,
    connectStorageEmulator,
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage'

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase (only once)
let app
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
} else {
    app = getApps()[0]
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// ============ AUTHENTICATION ============

/**
 * Sign out user
 */
export const logout = async () => {
    try {
        await signOut(auth)
        console.log('✅ User logged out')
    } catch (error) {
        console.error('Logout error:', error)
        throw error
    }
}

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user)
    })
}

// ============ FIRESTORE OPERATIONS ============

/**
 * Create a new NFT document
 */
export const createNFT = async (nftData) => {
    try {
        const docRef = await addDoc(collection(db, 'nfts'), {
            ...nftData,
            createdAt: new Date(),
        })
        console.log('✅ NFT created with ID:', docRef.id)
        return docRef.id
    } catch (error) {
        console.error('Create NFT error:', error)
        throw error
    }
}

/**
 * Get all NFTs
 */
export const getNFTs = async () => {
    try {
        const nftsRef = collection(db, 'nfts')
        const snapshot = await getDocs(nftsRef)
        const nfts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        return nfts
    } catch (error) {
        console.error('Get NFTs error:', error)
        throw error
    }
}

/**
 * Get NFT by ID
 */
export const getNFTById = async (nftId) => {
    try {
        const docRef = doc(db, 'nfts', nftId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() }
        } else {
            throw new Error('NFT not found')
        }
    } catch (error) {
        console.error('Get NFT error:', error)
        throw error
    }
}

/**
 * Get NFTs by creator
 */
export const getNFTsByCreator = async (creatorId) => {
    try {
        const q = query(
            collection(db, 'nfts'),
            where('creatorId', '==', creatorId)
        )
        const snapshot = await getDocs(q)
        const nfts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        return nfts
    } catch (error) {
        console.error('Get creator NFTs error:', error)
        throw error
    }
}

/**
 * Update NFT
 */
export const updateNFT = async (nftId, updates) => {
    try {
        const docRef = doc(db, 'nfts', nftId)
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date(),
        })
        console.log('✅ NFT updated')
    } catch (error) {
        console.error('Update NFT error:', error)
        throw error
    }
}

/**
 * Create submission/contact form entry
 */
export const createSubmission = async (submissionData) => {
    try {
        const docRef = await addDoc(collection(db, 'submissions'), {
            ...submissionData,
            createdAt: new Date(),
            status: 'pending',
        })
        console.log('✅ Submission created with ID:', docRef.id)
        return docRef.id
    } catch (error) {
        console.error('Create submission error:', error)
        throw error
    }
}

// ============ STORAGE OPERATIONS ============

/**
 * Upload file to Firebase Storage
 */
export const uploadFile = async (file, path) => {
    try {
        const storageRef = ref(storage, path)
        const snapshot = await uploadBytes(storageRef, file)
        console.log('✅ File uploaded:', snapshot.ref.fullPath)
        return snapshot.ref
    } catch (error) {
        console.error('Upload error:', error)
        throw error
    }
}

/**
 * Get download URL for file
 */
export const getFileURL = async (path) => {
    try {
        const storageRef = ref(storage, path)
        const url = await getDownloadURL(storageRef)
        return url
    } catch (error) {
        console.error('Get URL error:', error)
        throw error
    }
}

/**
 * Upload and get file URL in one step
 */
export const uploadAndGetURL = async (file, path) => {
    try {
        await uploadFile(file, path)
        return await getFileURL(path)
    } catch (error) {
        console.error('Upload and get URL error:', error)
        throw error
    }
}

export default {
    auth,
    db,
    storage,
    logout,
    onAuthChange,
    createNFT,
    getNFTs,
    getNFTById,
    getNFTsByCreator,
    updateNFT,
    createSubmission,
    uploadFile,
    getFileURL,
    uploadAndGetURL,
}
