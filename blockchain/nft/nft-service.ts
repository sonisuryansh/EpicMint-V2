import { web3Service } from '../web3/web3-service';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  animation_url?: string;
  background_color?: string;
  youtube_url?: string;
}

export interface MintNFTParams {
  to: string;
  metadata: NFTMetadata;
  royaltyRecipient?: string;
  royaltyPercentage?: number;
}

export interface NFTDetails {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadata?: NFTMetadata;
  royaltyInfo?: {
    recipient: string;
    percentage: number;
  };
}

export class NFTService {
  
  /**
   * Mint a new NFT
   */
  async mintNFT(params: MintNFTParams): Promise<string> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Upload metadata to IPFS first
      const metadataURI = await this.uploadMetadataToIPFS(params.metadata);

      // Prepare contract method
      const method = contract.methods.mintNFT(
        params.to,
        metadataURI,
        params.royaltyRecipient || web3Service.currentAccount,
        params.royaltyPercentage || 250 // 2.5% default royalty
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txHash);
      
      // Extract token ID from events
      const mintEvent = receipt.events?.NFTMinted;
      const tokenId = mintEvent?.returnValues?.tokenId;

      console.log(`NFT minted successfully. Token ID: ${tokenId}, Tx: ${txHash}`);
      return tokenId;

    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * Batch mint multiple NFTs
   */
  async batchMintNFT(params: MintNFTParams[]): Promise<string[]> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Upload all metadata to IPFS
      const metadataURIs = await Promise.all(
        params.map(param => this.uploadMetadataToIPFS(param.metadata))
      );

      // Prepare batch parameters
      const recipients = params.map(p => p.to);
      const royaltyRecipients = params.map(p => p.royaltyRecipient || web3Service.currentAccount!);
      const royaltyPercentages = params.map(p => p.royaltyPercentage || 250);

      // Prepare contract method
      const method = contract.methods.batchMintNFT(
        recipients,
        metadataURIs,
        royaltyRecipients,
        royaltyPercentages
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txHash);
      
      // Extract token IDs from events
      const mintEvents = receipt.events?.NFTMinted || [];
      const tokenIds = Array.isArray(mintEvents) 
        ? mintEvents.map(event => event.returnValues.tokenId)
        : [mintEvents.returnValues.tokenId];

      console.log(`Batch minted ${tokenIds.length} NFTs. Tx: ${txHash}`);
      return tokenIds;

    } catch (error) {
      console.error('Error batch minting NFTs:', error);
      throw error;
    }
  }

  /**
   * Get NFT details by token ID
   */
  async getNFTDetails(tokenId: string): Promise<NFTDetails> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      // Get token URI
      const tokenURI = await contract.methods.tokenURI(tokenId).call();
      
      // Get owner
      const owner = await contract.methods.ownerOf(tokenId).call();
      
      // Get royalty info
      const royaltyInfo = await contract.methods.royaltyInfo(tokenId, 10000).call();
      
      // Fetch metadata from IPFS
      let metadata: NFTMetadata | undefined;
      try {
        const response = await fetch(tokenURI);
        metadata = await response.json();
      } catch (error) {
        console.warn('Failed to fetch metadata:', error);
      }

      return {
        tokenId,
        owner,
        tokenURI,
        metadata,
        royaltyInfo: {
          recipient: royaltyInfo[0],
          percentage: parseInt(royaltyInfo[1]) / 100 // Convert from basis points
        }
      };

    } catch (error) {
      console.error('Error getting NFT details:', error);
      throw error;
    }
  }

  /**
   * Get NFTs owned by an address
   */
  async getNFTsByOwner(owner: string): Promise<string[]> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      const tokenIds = await contract.methods.getTokensByOwner(owner).call();
      return tokenIds;

    } catch (error) {
      console.error('Error getting NFTs by owner:', error);
      throw error;
    }
  }

  /**
   * Get current token ID (total minted)
   */
  async getCurrentTokenId(): Promise<string> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      const tokenId = await contract.methods.getCurrentTokenId().call();
      return tokenId;

    } catch (error) {
      console.error('Error getting current token ID:', error);
      throw error;
    }
  }

  /**
   * Burn an NFT
   */
  async burnNFT(tokenId: string): Promise<string> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Check if user owns the token
      const owner = await contract.methods.ownerOf(tokenId).call();
      if (owner.toLowerCase() !== web3Service.currentAccount.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Prepare contract method
      const method = contract.methods.burn(tokenId);

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`NFT ${tokenId} burned successfully. Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error burning NFT:', error);
      throw error;
    }
  }

  /**
   * Transfer NFT to another address
   */
  async transferNFT(tokenId: string, to: string): Promise<string> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Check if user owns the token
      const owner = await contract.methods.ownerOf(tokenId).call();
      if (owner.toLowerCase() !== web3Service.currentAccount.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Prepare contract method
      const method = contract.methods.safeTransferFrom(
        web3Service.currentAccount,
        to,
        tokenId
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`NFT ${tokenId} transferred to ${to}. Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  /**
   * Approve marketplace to handle NFT
   */
  async approveMarketplace(tokenId: string): Promise<string> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      const network = web3Service.currentNetwork;
      if (!network) {
        throw new Error('Network not supported');
      }

      // Prepare contract method
      const method = contract.methods.approve(
        network.contracts.marketplace,
        tokenId
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`NFT ${tokenId} approved for marketplace. Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error approving NFT:', error);
      throw error;
    }
  }

  /**
   * Set approval for all NFTs to marketplace
   */
  async setApprovalForAll(approved: boolean): Promise<string> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      const network = web3Service.currentNetwork;
      if (!network) {
        throw new Error('Network not supported');
      }

      // Prepare contract method
      const method = contract.methods.setApprovalForAll(
        network.contracts.marketplace,
        approved
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`Approval for all NFTs set to ${approved}. Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error setting approval for all:', error);
      throw error;
    }
  }

  /**
   * Check if marketplace is approved for all NFTs
   */
  async isApprovedForAll(): Promise<boolean> {
    try {
      const contract = web3Service.nftContractInstance;
      if (!contract) {
        throw new Error('NFT contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      const network = web3Service.currentNetwork;
      if (!network) {
        throw new Error('Network not supported');
      }

      const isApproved = await contract.methods.isApprovedForAll(
        web3Service.currentAccount,
        network.contracts.marketplace
      ).call();

      return isApproved;

    } catch (error) {
      console.error('Error checking approval status:', error);
      throw error;
    }
  }

  /**
   * Upload metadata to IPFS
   */
  private async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      // This would use a service like Pinata, Infura, or your own IPFS node
      // For demo purposes, returning a placeholder
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const result = await response.json();
      return result.ipfsUrl; // Should return something like "ipfs://QmHash"

    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  /**
   * Validate NFT metadata
   */
  validateMetadata(metadata: NFTMetadata): boolean {
    const required = ['name', 'description', 'image'];
    
    for (const field of required) {
      if (!metadata[field as keyof NFTMetadata]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(metadata.attributes)) {
      throw new Error('Attributes must be an array');
    }

    return true;
  }
}

// Export singleton instance
export const nftService = new NFTService();