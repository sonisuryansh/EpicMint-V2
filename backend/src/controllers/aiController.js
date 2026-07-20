const { GoogleGenerativeAI } = require('@google/generative-ai')
const { asyncHandler } = require('../middleware/errorHandler')

// Helper to initialize Google Gemini AI model using gemini-3.1-flash-lite
const getAIModel = (modelName = 'gemini-3.1-flash-lite') => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_key') {
        throw new Error('Gemini API key is not configured in backend environment')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    return genAI.getGenerativeModel({ model: modelName })
}

// Generate creative NFT titles using AI with fail-safe fallbacks
const generateTitle = asyncHandler(async (req, res) => {
    const { prompt, category } = req.body

    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' })
    }

    try {
        const model = getAIModel()
        const systemPrompt = `You are an expert creative copywriter for high-end Web3 NFT collections.
Generate 5 distinct, highly catchy, and unique NFT titles matching the user description: "${prompt}" and category: "${category || 'art'}".
Provide the response as a valid JSON array of strings: ["Title 1", "Title 2", ...]. Return ONLY the JSON array, no extra text, markdown code blocks, or formatting.`

        const result = await model.generateContent(systemPrompt)
        const text = result.response.text().trim()
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const titles = JSON.parse(cleaned)
        return res.json({ success: true, titles })
    } catch (err) {
        console.warn('Gemini API notice (fallback title used):', err.message)
        const capitalizedCategory = (category || 'art').charAt(0).toUpperCase() + (category || 'art').slice(1)
        return res.json({
            success: true,
            titles: [
                `${prompt.slice(0, 30)} #1`,
                `Cyber ${capitalizedCategory} Vision`,
                `Neo ${prompt.slice(0, 20)}`,
                `Apex ${capitalizedCategory} Collectible`,
                `Epic ${prompt.slice(0, 20)} Genesis`
            ]
        })
    }
})

// Generate engaging NFT description using AI with fail-safe fallbacks
const generateDescription = asyncHandler(async (req, res) => {
    const { title, prompt, category } = req.body

    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' })
    }

    try {
        const model = getAIModel()
        const systemPrompt = `You are a creative writer for Web3 digital collectibles.
Write an engaging, atmospheric, and professional NFT metadata description for an NFT titled "${title || 'Untitled'}" of category "${category || 'art'}".
User prompt description: "${prompt}".
Keep it to under 150 words. Return ONLY the description text, no other text.`

        const result = await model.generateContent(systemPrompt)
        const description = result.response.text().trim()
        return res.json({ success: true, description })
    } catch (err) {
        console.warn('Gemini API notice (fallback description used):', err.message)
        return res.json({
            success: true,
            description: `A unique digital collectible created on EpicMint marketplace. "${prompt}". Powered by OpenZeppelin ERC-721 smart contract standards and Pinata IPFS immutable storage.`
        })
    }
})

// Generate search tags for NFT metadata with fail-safe fallbacks
const generateTags = asyncHandler(async (req, res) => {
    const { description } = req.body

    if (!description) {
        return res.status(400).json({ success: false, message: 'Description is required' })
    }

    try {
        const model = getAIModel()
        const systemPrompt = `Analyze this NFT description and generate 5 to 8 single-word relevant tags for metadata indexing.
Description: "${description}"
Provide the response as a valid JSON array of strings: ["tag1", "tag2", ...]. Return ONLY the JSON array, no extra text, markdown code blocks, or formatting.`

        const result = await model.generateContent(systemPrompt)
        const text = result.response.text().trim()
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const tags = JSON.parse(cleaned)
        return res.json({ success: true, tags })
    } catch (err) {
        return res.json({ success: true, tags: ['art', 'nft', 'collectible', 'epicmint', 'web3'] })
    }
})

// Generate OpenSea attributes with fail-safe fallbacks
const generateAttributes = asyncHandler(async (req, res) => {
    const { description, category } = req.body

    if (!description) {
        return res.status(400).json({ success: false, message: 'Description is required' })
    }

    try {
        const model = getAIModel()
        const systemPrompt = `Generate a set of 3 to 5 metadata attributes/properties suitable for an ERC-721 NFT matching:
Category: "${category || 'art'}"
Description: "${description}"
Attributes must follow the OpenSea metadata standard (JSON array of objects with "trait_type" and "value" keys).
Example format: [{"trait_type": "Background", "value": "Neon"}, {"trait_type": "Power", "value": 85}]
Return ONLY the JSON array, no extra text, markdown, or comments.`

        const result = await model.generateContent(systemPrompt)
        const text = result.response.text().trim()
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const attributes = JSON.parse(cleaned)
        return res.json({ success: true, attributes })
    } catch (err) {
        return res.json({
            success: true,
            attributes: [
                { trait_type: 'Category', value: category || 'art' },
                { trait_type: 'Rarity', value: 'Rare' },
                { trait_type: 'Edition', value: 'Genesis Edition' }
            ]
        })
    }
})

// Optimize prompt for generative art text-to-image AI models
const optimizePrompt = asyncHandler(async (req, res) => {
    const { prompt } = req.body

    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' })
    }

    try {
        const model = getAIModel()
        const systemPrompt = `You are a prompt engineer for stable diffusion and midjourney text-to-image generators.
Optimize the following basic user prompt for high-quality, detailed, artistic digital art creation:
"${prompt}"
Enhance with style indicators, lighting, camera angles, color palettes, and resolution modifiers (e.g. 8k, highly detailed, photorealistic, cyberpunk, dramatic lighting).
Return ONLY the optimized prompt text, no other introductions or comments.`

        const result = await model.generateContent(systemPrompt)
        const optimized = result.response.text().trim()
        return res.json({ success: true, optimized })
    } catch (err) {
        return res.json({
            success: true,
            optimized: `${prompt}, 8k resolution, highly detailed, photorealistic digital art, dramatic lighting, trending on polycount, octane render`
        })
    }
})

// Generate complete professional NFT metadata object with fail-safe fallbacks
const generateMetadata = asyncHandler(async (req, res) => {
    let { title, description, prompt } = req.body

    if (prompt) {
        title = prompt
        description = prompt
    }

    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' })
    }

    try {
        const model = getAIModel()
        const systemPrompt = `You are a high-end Web3 NFT copywriter and metadata expert.
Analyze the user's initial NFT Title: "${title}" and NFT Description: "${description}".
Generate enhanced, professional NFT metadata in JSON format. The response must be a single JSON object with EXACTLY the following keys:
{
  "title": "An enhanced, highly engaging and creative version of the initial title",
  "description": "An enhanced, professional, rich, and highly appealing metadata description",
  "summary": "A short, one-sentence summary of the NFT",
  "tags": ["A JSON array of 5-8 single-word search tags matching the theme"],
  "category": "One category from this exact list: art, gaming, collectibles, music, photography, sports, utility",
  "collection": "A suggested name for a creative collection this NFT could belong to",
  "attributes": [
    {"trait_type": "Background", "value": "e.g. Neon, Cosmic, Vintage"},
    {"trait_type": "Rarity", "value": "e.g. Rare, Legendary, Common"},
    {"trait_type": "Style", "value": "e.g. Cyberpunk, Minimalist, 3D Render"}
  ],
  "royaltyPercentage": A float value representing suggested royalties between 0.0 and 10.0 (e.g. 2.5)
}
Return ONLY the raw JSON object. Do not include markdown code blocks, HTML, comment tags, or introductory text.`

        const result = await model.generateContent(systemPrompt)
        const text = result.response.text().trim()
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const metadata = JSON.parse(cleaned)
        return res.json({ success: true, metadata })
    } catch (err) {
        console.warn('Gemini metadata generation failover:', err.message)
        return res.json({
            success: true,
            metadata: {
                title: `${title} (AI Genesis)`,
                description: description || `An extraordinary digital artwork created on EpicMint.`,
                summary: 'An elegant digital collectible.',
                tags: ['nft', 'art', 'collectible', 'epicmint', 'web3'],
                category: 'art',
                collection: 'EpicMint Originals',
                attributes: [
                    { trait_type: 'Rarity', value: 'Rare' },
                    { trait_type: 'Edition', value: 'Genesis Edition' },
                    { trait_type: 'Network', value: 'Sepolia' }
                ],
                royaltyPercentage: 2.5
            }
        })
    }
})

module.exports = {
    generateTitle,
    generateDescription,
    generateTags,
    generateAttributes,
    optimizePrompt,
    generateMetadata,
}
