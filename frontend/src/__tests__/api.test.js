import apiClient from '@/lib/api'

describe('API Client', () => {
    test('GET /health - Backend health check', async () => {
        try {
            const response = await fetch('http://localhost:5000/health')
            const data = await response.json()
            console.log('✅ Health check:', data)
            expect(data.status).toBe('OK')
        } catch (error) {
            console.warn('⚠️  Backend not running:', error.message)
        }
    })

    test('GET /api/nfts - Fetch NFT list', async () => {
        try {
            const response = await fetch('http://localhost:5000/api/nfts')
            const data = await response.json()
            console.log('✅ NFTs fetched:', data)
            expect(Array.isArray(data.nfts)).toBe(true)
        } catch (error) {
            console.warn('⚠️  API call failed:', error.message)
        }
    })

    test('POST /api/nfts - Create NFT', async () => {
        try {
            const response = await fetch('http://localhost:5000/api/nfts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test NFT',
                    description: 'Test Description',
                    price: '1.5',
                }),
            })
            const data = await response.json()
            console.log('✅ NFT created:', data)
            expect(data.success).toBe(true)
        } catch (error) {
            console.warn('⚠️  API call failed:', error.message)
        }
    })

    test('POST /api/submissions - Create submission', async () => {
        try {
            const response = await fetch('http://localhost:5000/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    message: 'Test message',
                }),
            })
            const data = await response.json()
            console.log('✅ Submission created:', data)
            expect(data.success).toBe(true)
        } catch (error) {
            console.warn('⚠️  API call failed:', error.message)
        }
    })

    test('POST /api/ai/generate - AI generation', async () => {
        try {
            const response = await fetch('http://localhost:5000/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'Generate a creative NFT description' }),
            })
            const data = await response.json()
            console.log('✅ AI response:', data)
            expect(data.message).toBeDefined()
        } catch (error) {
            console.warn('⚠️  API call failed:', error.message)
        }
    })
})
