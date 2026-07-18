export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
  name?: string;
}

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  jwt?: string;
}

export interface IPFSMetadata {
  name: string;
  keyvalues?: Record<string, string>;
}

export class IPFSService {
  private pinataConfig: PinataConfig | null = null;
  private readonly pinataAPI = 'https://api.pinata.cloud';
  private readonly ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';

  constructor(config?: PinataConfig) {
    if (config) {
      this.pinataConfig = config;
    }
  }

  /**
   * Configure Pinata API credentials
   */
  configure(config: PinataConfig): void {
    this.pinataConfig = config;
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File, metadata?: IPFSMetadata): Promise<IPFSUploadResult> {
    if (!this.pinataConfig) {
      throw new Error('Pinata configuration not provided');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify({
          name: metadata.name || file.name,
          keyvalues: metadata.keyvalues || {}
        }));
      }

      const response = await fetch(`${this.pinataAPI}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataConfig.apiKey,
          'pinata_secret_api_key': this.pinataConfig.apiSecret,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Pinata upload failed: ${error.error}`);
      }

      const result = await response.json();

      return {
        hash: result.IpfsHash,
        url: `ipfs://${result.IpfsHash}`,
        size: result.PinSize,
        name: file.name,
      };

    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS via Pinata
   */
  async uploadJSON(data: any, metadata?: IPFSMetadata): Promise<IPFSUploadResult> {
    if (!this.pinataConfig) {
      throw new Error('Pinata configuration not provided');
    }

    try {
      const requestBody: any = {
        pinataContent: data,
      };

      if (metadata) {
        requestBody.pinataMetadata = {
          name: metadata.name,
          keyvalues: metadata.keyvalues || {}
        };
      }

      const response = await fetch(`${this.pinataAPI}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataConfig.apiKey,
          'pinata_secret_api_key': this.pinataConfig.apiSecret,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Pinata upload failed: ${error.error}`);
      }

      const result = await response.json();

      return {
        hash: result.IpfsHash,
        url: `ipfs://${result.IpfsHash}`,
        size: result.PinSize,
        name: metadata?.name,
      };

    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload NFT metadata to IPFS
   */
  async uploadNFTMetadata(metadata: {
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
  }): Promise<IPFSUploadResult> {
    const pinataMetadata: IPFSMetadata = {
      name: `${metadata.name} - NFT Metadata`,
      keyvalues: {
        type: 'nft-metadata',
        nft_name: metadata.name,
      }
    };

    return this.uploadJSON(metadata, pinataMetadata);
  }

  /**
   * Upload image and create NFT metadata
   */
  async uploadNFTWithImage(
    imageFile: File,
    metadata: {
      name: string;
      description: string;
      external_url?: string;
      attributes: Array<{
        trait_type: string;
        value: string | number;
      }>;
      animation_url?: string;
      background_color?: string;
    }
  ): Promise<{ imageResult: IPFSUploadResult; metadataResult: IPFSUploadResult }> {
    try {
      // Upload image first
      const imageResult = await this.uploadFile(imageFile, {
        name: `${metadata.name} - Image`,
        keyvalues: {
          type: 'nft-image',
          nft_name: metadata.name,
        }
      });

      // Create metadata with image URL
      const nftMetadata = {
        ...metadata,
        image: imageResult.url,
      };

      // Upload metadata
      const metadataResult = await this.uploadNFTMetadata(nftMetadata);

      return {
        imageResult,
        metadataResult,
      };

    } catch (error) {
      console.error('Error uploading NFT with image:', error);
      throw error;
    }
  }

  /**
   * Get pinned files from Pinata
   */
  async getPinnedFiles(
    filters?: {
      hashContains?: string;
      pinStart?: string;
      pinEnd?: string;
      unpinStart?: string;
      unpinEnd?: string;
      pinSizeMin?: number;
      pinSizeMax?: number;
      metadata?: Record<string, string>;
    }
  ): Promise<any[]> {
    if (!this.pinataConfig) {
      throw new Error('Pinata configuration not provided');
    }

    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === 'metadata' && typeof value === 'object') {
              queryParams.append(key, JSON.stringify(value));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const url = `${this.pinataAPI}/data/pinList?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.pinataConfig.apiKey,
          'pinata_secret_api_key': this.pinataConfig.apiSecret,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get pinned files: ${error.error}`);
      }

      const result = await response.json();
      return result.rows;

    } catch (error) {
      console.error('Error getting pinned files:', error);
      throw error;
    }
  }

  /**
   * Unpin file from Pinata
   */
  async unpinFile(ipfsHash: string): Promise<void> {
    if (!this.pinataConfig) {
      throw new Error('Pinata configuration not provided');
    }

    try {
      const response = await fetch(`${this.pinataAPI}/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers: {
          'pinata_api_key': this.pinataConfig.apiKey,
          'pinata_secret_api_key': this.pinataConfig.apiSecret,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to unpin file: ${error.error}`);
      }

      console.log(`File ${ipfsHash} unpinned successfully`);

    } catch (error) {
      console.error('Error unpinning file:', error);
      throw error;
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.pinataConfig) {
      throw new Error('Pinata configuration not provided');
    }

    try {
      const response = await fetch(`${this.pinataAPI}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.pinataConfig.apiKey,
          'pinata_secret_api_key': this.pinataConfig.apiSecret,
        },
      });

      return response.ok;

    } catch (error) {
      console.error('Error testing Pinata connection:', error);
      return false;
    }
  }

  /**
   * Get file from IPFS via gateway
   */
  async getFile(ipfsHash: string): Promise<Response> {
    try {
      const url = `${this.ipfsGateway}${ipfsHash}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw error;
    }
  }

  /**
   * Get JSON data from IPFS
   */
  async getJSON(ipfsHash: string): Promise<any> {
    try {
      const response = await this.getFile(ipfsHash);
      return await response.json();

    } catch (error) {
      console.error('Error getting JSON from IPFS:', error);
      throw error;
    }
  }

  /**
   * Convert IPFS URL to HTTP gateway URL
   */
  ipfsToHttp(ipfsUrl: string): string {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `${this.ipfsGateway}${hash}`;
    }
    
    if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('bafy')) {
      return `${this.ipfsGateway}${ipfsUrl}`;
    }

    return ipfsUrl; // Already HTTP URL
  }

  /**
   * Convert HTTP gateway URL to IPFS URL
   */
  httpToIpfs(httpUrl: string): string {
    if (httpUrl.includes('/ipfs/')) {
      const hash = httpUrl.split('/ipfs/')[1].split('?')[0];
      return `ipfs://${hash}`;
    }

    return httpUrl; // Not a gateway URL
  }

  /**
   * Validate IPFS hash
   */
  isValidIPFSHash(hash: string): boolean {
    // Check for CIDv0 (Qm...)
    if (hash.startsWith('Qm') && hash.length === 46) {
      return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
    }

    // Check for CIDv1 (bafy...)
    if (hash.startsWith('bafy') && hash.length >= 56) {
      return /^bafy[0-9a-z]{55,}$/.test(hash);
    }

    return false;
  }

  /**
   * Get IPFS gateway URL
   */
  getGatewayUrl(): string {
    return this.ipfsGateway;
  }

  /**
   * Set custom IPFS gateway
   */
  setGateway(gateway: string): void {
    // Ensure gateway ends with /
    // this.ipfsGateway = gateway.endsWith('/') ? gateway : `${gateway}/`;
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Export utility functions
export const ipfsUtils = {
  toHttp: (ipfsUrl: string) => ipfsService.ipfsToHttp(ipfsUrl),
  toIpfs: (httpUrl: string) => ipfsService.httpToIpfs(httpUrl),
  isValidHash: (hash: string) => ipfsService.isValidIPFSHash(hash),
};