const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

/**
 * Service to handle Pinata IPFS image and metadata pinning
 */

const getPinataJWT = () => {
    const jwt = process.env.PINATA_JWT
    if (!jwt || jwt === 'your_pinata_jwt') {
        throw new Error('PINATA_JWT environment variable is not configured')
    }
    return jwt
}

/**
 * Upload an image file or buffer to Pinata IPFS
 * @param {string|Buffer} fileSource - Local file path string or Buffer
 * @param {string} filename - Filename for Pinata metadata
 * @returns {Promise<{ ipfsCID: string, image: string, gatewayUrl: string }>}
 */
const uploadImage = async (fileSource, filename = 'nft-image.jpg') => {
    const jwt = getPinataJWT()
    const data = new FormData()

    if (Buffer.isBuffer(fileSource)) {
        data.append('file', fileSource, { filename })
    } else {
        data.append('file', fs.createReadStream(fileSource), { filename })
    }

    data.append('pinataOptions', JSON.stringify({ cidVersion: 0 }))
    data.append('pinataMetadata', JSON.stringify({ name: filename }))

    const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data,
        {
            maxBodyLength: Infinity,
            headers: {
                ...data.getHeaders(),
                Authorization: `Bearer ${jwt}`,
            },
        }
    )

    const ipfsCID = response.data.IpfsHash
    return {
        ipfsCID,
        image: `ipfs://${ipfsCID}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCID}`,
    }
}

/**
 * Upload metadata JSON object to Pinata IPFS
 * @param {Object} metadataObj - ERC-721/1155 metadata object
 * @returns {Promise<{ metadataCID: string, tokenURI: string }>}
 */
const uploadMetadata = async (metadataObj) => {
    const jwt = getPinataJWT()

    const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
            pinataOptions: { cidVersion: 0 },
            pinataMetadata: { name: `${metadataObj.name || 'nft'}-metadata.json` },
            pinataContent: metadataObj,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
        }
    )

    const metadataCID = response.data.IpfsHash
    return {
        metadataCID,
        tokenURI: `ipfs://${metadataCID}`,
    }
}

module.exports = {
    uploadImage,
    uploadMetadata,
}
