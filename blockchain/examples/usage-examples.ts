import { walletManager } from '../wallet/wallet-manager';
import { nftService } from '../nft/nft-service';
import { marketplaceService } from '../nft/marketplace-service';
import { ipfsService } from '../ipfs/ipfs-service';

/**
 * Example: Complete NFT minting and listing workflow
 */
export async function mintAndListNFTExample() {
  try {
    console.log('Starting NFT mint and list example...');

    // Step 1: Connect wallet
    console.log('1. Connecting wallet...');
    const connection = await walletManager.connect();
    console.log('Wallet connected:', connection);

    // Step 2: Configure IPFS (Pinata)
    console.log('2. Configuring IPFS...');
    ipfsService.configure({
      apiKey: 'YOUR_PINATA_API_KEY',
      apiSecret: 'YOUR_PINATA_SECRET_KEY',
    });

    // Step 3: Create NFT metadata
    console.log('3. Creating NFT metadata...');
    const metadata = {
      name: 'Epic Story NFT #1',
      description: 'A beautiful story about adventure and discovery in the digital realm.',
      image: '', // Will be set after image upload
      external_url: 'https://epicmint.io/nft/1',
      attributes: [
        {
          trait_type: 'Category',
          value: 'Story'
        },
        {
          trait_type: 'Genre',
          value: 'Adventure'
        },
        {
          trait_type: 'Rarity',
          value: 'Rare'
        },
        {
          trait_type: 'Author',
          value: 'Digital Storyteller'
        }
      ],
      animation_url: 'https://epicmint.io/animations/story1.mp4',
      background_color: 'A37ACC'
    };

    // Step 4: Upload image to IPFS (example with File object)
    console.log('4. Uploading image to IPFS...');
    // Note: In a real app, you'd get this from a file input
    const imageBlob = new Blob(['fake image data'], { type: 'image/png' });
    const imageFile = new File([imageBlob], 'epic-story.png', { type: 'image/png' });
    
    const { imageResult, metadataResult } = await ipfsService.uploadNFTWithImage(
      imageFile,
      metadata
    );
    
    console.log('Image uploaded:', imageResult);
    console.log('Metadata uploaded:', metadataResult);

    // Step 5: Mint NFT
    console.log('5. Minting NFT...');
    const tokenId = await nftService.mintNFT({
      to: connection.account,
      metadata: {
        ...metadata,
        image: imageResult.url
      },
      royaltyRecipient: connection.account,
      royaltyPercentage: 250 // 2.5%
    });
    
    console.log('NFT minted! Token ID:', tokenId);

    // Step 6: Approve marketplace
    console.log('6. Approving marketplace...');
    await nftService.setApprovalForAll(true);
    console.log('Marketplace approved');

    // Step 7: List NFT for sale
    console.log('7. Listing NFT for sale...');
    const network = walletManager.getConnection()?.chainId;
    const nftContractAddress = 'YOUR_NFT_CONTRACT_ADDRESS'; // Replace with actual address
    
    const listingId = await marketplaceService.createListing(
      tokenId,
      nftContractAddress,
      '0.1' // 0.1 ETH
    );
    
    console.log('NFT listed! Listing ID:', listingId);

    return {
      tokenId,
      listingId,
      imageHash: imageResult.hash,
      metadataHash: metadataResult.hash
    };

  } catch (error) {
    console.error('Error in mint and list example:', error);
    throw error;
  }
}

/**
 * Example: Buy an NFT from marketplace
 */
export async function buyNFTExample(listingId: string) {
  try {
    console.log('Starting NFT purchase example...');

    // Step 1: Connect wallet
    const connection = await walletManager.connect();
    console.log('Wallet connected:', connection);

    // Step 2: Get listing details
    console.log('2. Getting listing details...');
    const listing = await marketplaceService.getListing(listingId);
    console.log('Listing details:', listing);

    // Step 3: Buy the NFT
    console.log('3. Purchasing NFT...');
    const txHash = await marketplaceService.buyItem(listingId, listing.price);
    console.log('Purchase successful! Transaction:', txHash);

    return { txHash, listing };

  } catch (error) {
    console.error('Error in buy NFT example:', error);
    throw error;
  }
}

/**
 * Example: Create and participate in auction
 */
export async function auctionExample() {
  try {
    console.log('Starting auction example...');

    // Step 1: Connect wallet
    const connection = await walletManager.connect();
    console.log('Wallet connected:', connection);

    // Step 2: Create auction (assuming you own token ID 1)
    console.log('2. Creating auction...');
    const nftContractAddress = 'YOUR_NFT_CONTRACT_ADDRESS';
    const tokenId = '1';
    const startingPrice = '0.05'; // 0.05 ETH
    const duration = 24 * 60 * 60; // 24 hours in seconds

    const auctionId = await marketplaceService.createAuction(
      tokenId,
      nftContractAddress,
      startingPrice,
      duration
    );
    
    console.log('Auction created! ID:', auctionId);

    // Step 3: Place a bid (you'd typically do this from another account)
    console.log('3. Placing bid...');
    const bidAmount = '0.06'; // 0.06 ETH
    
    const bidTxHash = await marketplaceService.placeBid(auctionId, bidAmount);
    console.log('Bid placed! Transaction:', bidTxHash);

    // Step 4: Get auction details
    console.log('4. Getting auction details...');
    const auction = await marketplaceService.getAuction(auctionId);
    console.log('Auction details:', auction);

    return { auctionId, auction };

  } catch (error) {
    console.error('Error in auction example:', error);
    throw error;
  }
}

/**
 * Example: Batch mint NFTs
 */
export async function batchMintExample() {
  try {
    console.log('Starting batch mint example...');

    // Step 1: Connect wallet
    const connection = await walletManager.connect();
    console.log('Wallet connected:', connection);

    // Step 2: Configure IPFS
    ipfsService.configure({
      apiKey: 'YOUR_PINATA_API_KEY',
      apiSecret: 'YOUR_PINATA_SECRET_KEY',
    });

    // Step 3: Prepare multiple NFTs
    console.log('2. Preparing NFT collection...');
    const nfts = [
      {
        name: 'Epic Poetry #1',
        description: 'A collection of beautiful poems about nature',
        category: 'Poetry',
        genre: 'Nature'
      },
      {
        name: 'Epic Poetry #2',
        description: 'Poems about love and relationships',
        category: 'Poetry',
        genre: 'Romance'
      },
      {
        name: 'Epic Poetry #3',
        description: 'Dark and mysterious poetry collection',
        category: 'Poetry',
        genre: 'Dark'
      }
    ];

    // Step 4: Upload metadata for each NFT
    console.log('3. Uploading metadata...');
    const metadataUploads = await Promise.all(
      nfts.map(async (nft, index) => {
        const metadata = {
          name: nft.name,
          description: nft.description,
          image: `ipfs://QmExampleHash${index + 1}`, // Placeholder
          attributes: [
            { trait_type: 'Category', value: nft.category },
            { trait_type: 'Genre', value: nft.genre },
            { trait_type: 'Edition', value: index + 1 }
          ]
        };

        return ipfsService.uploadNFTMetadata(metadata);
      })
    );

    console.log('Metadata uploaded for all NFTs');

    // Step 5: Batch mint NFTs
    console.log('4. Batch minting NFTs...');
    const mintParams = metadataUploads.map((metadataResult) => ({
      to: connection.account,
      metadata: {
        name: '',
        description: '',
        image: '',
        attributes: []
      }, // Will use the uploaded metadata
      royaltyRecipient: connection.account,
      royaltyPercentage: 250
    }));

    const tokenIds = await nftService.batchMintNFT(mintParams);
    console.log('Batch minting complete! Token IDs:', tokenIds);

    return { tokenIds, metadataUploads };

  } catch (error) {
    console.error('Error in batch mint example:', error);
    throw error;
  }
}

/**
 * Example: Transfer NFT
 */
export async function transferNFTExample(tokenId: string, toAddress: string) {
  try {
    console.log('Starting NFT transfer example...');

    // Step 1: Connect wallet
    const connection = await walletManager.connect();
    console.log('Wallet connected:', connection);

    // Step 2: Transfer NFT
    console.log('2. Transferring NFT...');
    const txHash = await nftService.transferNFT(tokenId, toAddress);
    console.log('Transfer successful! Transaction:', txHash);

    return { txHash };

  } catch (error) {
    console.error('Error in transfer NFT example:', error);
    throw error;
  }
}

/**
 * Example: Get user's NFT collection
 */
export async function getUserCollectionExample(userAddress?: string) {
  try {
    console.log('Starting get user collection example...');

    // Use provided address or connected wallet address
    let address = userAddress;
    if (!address) {
      const connection = await walletManager.connect();
      address = connection.account;
    }

    console.log('Getting NFTs for address:', address);

    // Step 1: Get token IDs
    const tokenIds = await nftService.getNFTsByOwner(address);
    console.log('Token IDs owned:', tokenIds);

    // Step 2: Get details for each NFT
    console.log('Getting details for each NFT...');
    const nftDetails = await Promise.all(
      tokenIds.map(tokenId => nftService.getNFTDetails(tokenId))
    );

    console.log('User collection:', nftDetails);
    return nftDetails;

  } catch (error) {
    console.error('Error in get user collection example:', error);
    throw error;
  }
}

/**
 * Example: Switch networks
 */
export async function networkSwitchExample() {
  try {
    console.log('Starting network switch example...');

    // Step 1: Connect wallet
    const connection = await walletManager.connect();
    console.log('Current network:', walletManager.getNetworkName());

    // Step 2: Switch to Polygon
    console.log('Switching to Polygon...');
    await walletManager.switchNetwork(137);
    console.log('Switched to:', walletManager.getNetworkName());

    // Step 3: Switch back to Ethereum
    console.log('Switching back to Ethereum...');
    await walletManager.switchNetwork(1);
    console.log('Switched to:', walletManager.getNetworkName());

  } catch (error) {
    console.error('Error in network switch example:', error);
    throw error;
  }
}