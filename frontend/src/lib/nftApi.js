// nftApi.js — Replaces firebase.js
// All NFT/submission operations now go through the Express backend API
import { nftAPI, submissionAPI, uploadAPI } from './api'

/**
 * Create a new NFT record in MongoDB
 */
export const createNFT = async (nftData) => {
    const res = await nftAPI.create(nftData)
    return res.data.data
}

/**
 * Get all NFTs (with optional filters)
 */
export const getNFTs = async (params = {}) => {
    const res = await nftAPI.getAll(params)
    return res.data
}

/**
 * Get NFT by MongoDB ID
 */
export const getNFTById = async (id) => {
    const res = await nftAPI.getById(id)
    return res.data.data
}

/**
 * Get NFTs by creator wallet address
 */
export const getNFTsByCreator = async (creatorAddress) => {
    const res = await nftAPI.getAll({ creatorAddress })
    return res.data.data
}

/**
 * Get NFTs by owner wallet address
 */
export const getNFTsByOwner = async (ownerAddress) => {
    const res = await nftAPI.getAll({ ownerAddress })
    return res.data.data
}

/**
 * Update NFT
 */
export const updateNFT = async (id, updates) => {
    const res = await nftAPI.update(id, updates)
    return res.data.data
}

/**
 * Delete NFT
 */
export const deleteNFT = async (id) => {
    const res = await nftAPI.delete(id)
    return res.data
}

/**
 * Create a contact/submission form entry
 */
export const createSubmission = async (submissionData) => {
    const res = await submissionAPI.create(submissionData)
    return res.data
}

/**
 * Upload file to backend (then relayed to Pinata IPFS)
 */
export const uploadFile = async (file, onProgress) => {
    const res = await uploadAPI.uploadImage(file, onProgress)
    return res.data.data
}

/**
 * Upload NFT metadata JSON to IPFS via backend
 */
export const uploadMetadata = async (metadata) => {
    const res = await uploadAPI.uploadMetadata(metadata)
    return res.data.data
}

export default {
    createNFT,
    getNFTs,
    getNFTById,
    getNFTsByCreator,
    getNFTsByOwner,
    updateNFT,
    deleteNFT,
    createSubmission,
    uploadFile,
    uploadMetadata,
}
