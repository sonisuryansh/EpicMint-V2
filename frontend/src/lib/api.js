import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
})

// ===== REQUEST INTERCEPTOR =====
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('epicmint_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ===== RESPONSE INTERCEPTOR =====
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('epicmint_token')
            localStorage.removeItem('epicmint_user')
            window.dispatchEvent(new CustomEvent('auth:logout'))
        }
        return Promise.reject(error)
    }
)

// ===== AUTH API =====
export const authAPI = {
    register: (data) => apiClient.post('/api/auth/register', data),
    login: (data) => apiClient.post('/api/auth/login', data),
    googleAuth: (idToken) => apiClient.post('/api/auth/google', { idToken }),
    walletAuth: (data) => apiClient.post('/api/auth/wallet', data),
    linkGoogle: (idToken) => apiClient.post('/api/auth/link-google', { idToken }),
    linkWallet: (data) => apiClient.post('/api/auth/link-wallet', data),
    unlinkWallet: () => apiClient.post('/api/auth/unlink-wallet'),
    getNonce: (walletAddress) => apiClient.get(`/api/auth/nonce/${walletAddress}`),
    getMe: () => apiClient.get('/api/auth/me'),
    updateProfile: (data) => apiClient.put('/api/auth/profile', data),
    followUser: (target) => apiClient.post(`/api/auth/follow/${target}`),
}

// ===== NFT API =====
export const nftAPI = {
    getAll: (params = {}) => apiClient.get('/api/nfts', { params }),
    getById: (idOrObject) => {
        if (idOrObject && typeof idOrObject === 'object' && idOrObject.contractAddress && idOrObject.tokenId) {
            return apiClient.get(`/api/nfts/${idOrObject.contractAddress}/${idOrObject.tokenId}`)
        }
        return apiClient.get(`/api/nfts/${idOrObject}`)
    },
    create: (data) => apiClient.post('/api/nfts', data),
    buy: (id, data) => apiClient.post(`/api/nfts/${id}/buy`, data),
    update: (id, data) => apiClient.put(`/api/nfts/${id}`, data),
    delete: (id) => apiClient.delete(`/api/nfts/${id}`),
    like: (id) => apiClient.post(`/api/nfts/${id}/like`),
    getStats: () => apiClient.get('/api/nfts/stats'),
}

// ===== UPLOAD API =====
export const uploadAPI = {
    uploadImage: (file, onProgress) => {
        const formData = new FormData()
        formData.append('file', file)
        return apiClient.post('/api/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress
                ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
                : undefined,
        })
    },
    uploadMetadata: (data) => apiClient.post('/api/uploads/metadata', data),
}

// ===== SUBMISSIONS API =====
export const submissionAPI = {
    create: (data) => apiClient.post('/api/submissions', data),
    getAll: (params) => apiClient.get('/api/submissions', { params }),
}

// ===== AI API =====
export const aiAPI = {
    generateTitle: (prompt, category) => apiClient.post('/api/ai/generate-title', { prompt, category }),
    generateDescription: (title, prompt, category) => apiClient.post('/api/ai/generate-description', { title, prompt, category }),
    generateTags: (description) => apiClient.post('/api/ai/generate-tags', { description }),
    generateAttributes: (description, category) => apiClient.post('/api/ai/generate-attributes', { description, category }),
    optimizePrompt: (prompt) => apiClient.post('/api/ai/optimize-prompt', { prompt }),
    generateMetadata: (title, description, prompt) => apiClient.post('/api/ai/generate-metadata', { title, description, prompt }),
}

// ===== COMMENTS API =====
export const commentsAPI = {
    getByNFT: (nftId) => apiClient.get(`/api/comments/${nftId}`),
    create: (nftId, text) => apiClient.post(`/api/comments/${nftId}`, { text }),
    delete: (id) => apiClient.delete(`/api/comments/${id}`),
}

// ===== TRANSACTIONS API =====
export const transactionsAPI = {
    getByTokenId: (tokenId) => apiClient.get(`/api/transactions/${tokenId}`),
    create: (data) => apiClient.post('/api/transactions', data),
}

// ===== SUPPORT API =====
export const supportAPI = {
    submit: (formData) => apiClient.post('/api/support', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
}

// ===== BLOG API =====
export const blogAPI = {
    getAll: (params = {}) => apiClient.get('/api/blogs', { params }),
    getBySlug: (slug) => apiClient.get(`/api/blogs/${slug}`),
    create: (data) => apiClient.post('/api/blogs', data),
    update: (id, data) => apiClient.put(`/api/blogs/${id}`, data),
    delete: (id) => apiClient.delete(`/api/blogs/${id}`),
    toggleLike: (id) => apiClient.patch(`/api/blogs/${id}/like`),
    incrementView: (id) => apiClient.patch(`/api/blogs/${id}/view`),
}

// ===== BLOG AI API =====
export const blogAIAPI = {
    generate: (data) => apiClient.post('/api/blog-ai/generate', data),
}

export default apiClient

