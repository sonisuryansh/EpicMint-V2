import { web3Service } from '../web3/web3-service';

export interface MarketplaceListing {
  listingId: string;
  tokenId: string;
  nftContract: string;
  seller: string;
  price: string;
  listingTime: number;
  active: boolean;
}

export interface MarketplaceAuction {
  auctionId: string;
  tokenId: string;
  nftContract: string;
  seller: string;
  startingPrice: string;
  currentBid: string;
  currentBidder: string;
  startTime: number;
  endTime: number;
  active: boolean;
  ended: boolean;
}

export interface MarketplaceOffer {
  tokenId: string;
  nftContract: string;
  offerer: string;
  amount: string;
  expiration: number;
  active: boolean;
}

export class MarketplaceService {

  /**
   * Create a fixed price listing
   */
  async createListing(tokenId: string, nftContract: string, price: string): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Convert price to wei
      const priceInWei = web3Service.web3Instance!.utils.toWei(price, 'ether');

      // Prepare contract method
      const method = contract.methods.createListing(
        tokenId,
        nftContract,
        priceInWei
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txHash);
      
      // Extract listing ID from events
      const listingEvent = receipt.events?.ItemListed;
      const listingId = listingEvent?.returnValues?.listingId;

      console.log(`Listing created. ID: ${listingId}, Tx: ${txHash}`);
      return listingId;

    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  /**
   * Buy item from marketplace
   */
  async buyItem(listingId: string, price: string): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Prepare contract method
      const method = contract.methods.buyItem(listingId);

      // Send transaction with payment
      const txHash = await web3Service.sendTransaction(method, price);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`Item purchased. Listing ID: ${listingId}, Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error buying item:', error);
      throw error;
    }
  }

  /**
   * Cancel a listing
   */
  async cancelListing(listingId: string): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Prepare contract method
      const method = contract.methods.cancelListing(listingId);

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`Listing cancelled. ID: ${listingId}, Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  }

  /**
   * Create an auction
   */
  async createAuction(
    tokenId: string,
    nftContract: string,
    startingPrice: string,
    duration: number
  ): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Convert price to wei
      const priceInWei = web3Service.web3Instance!.utils.toWei(startingPrice, 'ether');

      // Prepare contract method
      const method = contract.methods.createAuction(
        tokenId,
        nftContract,
        priceInWei,
        duration
      );

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txHash);
      
      // Extract auction ID from events
      const auctionEvent = receipt.events?.AuctionCreated;
      const auctionId = auctionEvent?.returnValues?.auctionId;

      console.log(`Auction created. ID: ${auctionId}, Tx: ${txHash}`);
      return auctionId;

    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  }

  /**
   * Place a bid on an auction
   */
  async placeBid(auctionId: string, bidAmount: string): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Prepare contract method
      const method = contract.methods.placeBid(auctionId);

      // Send transaction with bid amount
      const txHash = await web3Service.sendTransaction(method, bidAmount);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`Bid placed. Auction ID: ${auctionId}, Amount: ${bidAmount} ETH, Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }

  /**
   * End an auction
   */
  async endAuction(auctionId: string): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Prepare contract method
      const method = contract.methods.endAuction(auctionId);

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`Auction ended. ID: ${auctionId}, Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error ending auction:', error);
      throw error;
    }
  }

  /**
   * Make an offer on an NFT
   */
  async makeOffer(
    tokenId: string,
    nftContract: string,
    offerAmount: string,
    expiration: number
  ): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Prepare contract method
      const method = contract.methods.makeOffer(
        tokenId,
        nftContract,
        expiration
      );

      // Send transaction with offer amount
      const txHash = await web3Service.sendTransaction(method, offerAmount);
      
      // Wait for confirmation
      const receipt = await web3Service.waitForTransaction(txHash);
      
      // Extract offer ID from events
      const offerEvent = receipt.events?.OfferMade;
      const offerId = offerEvent?.returnValues?.offerId;

      console.log(`Offer made. ID: ${offerId}, Amount: ${offerAmount} ETH, Tx: ${txHash}`);
      return offerId;

    } catch (error) {
      console.error('Error making offer:', error);
      throw error;
    }
  }

  /**
   * Accept an offer
   */
  async acceptOffer(offerId: string, offerIndex: number): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Prepare contract method
      const method = contract.methods.acceptOffer(offerId, offerIndex);

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      console.log(`Offer accepted. ID: ${offerId}, Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  /**
   * Withdraw pending payments
   */
  async withdraw(): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      // Check pending withdrawal amount
      const pendingAmount = await contract.methods
        .pendingWithdrawals(web3Service.currentAccount)
        .call();

      if (pendingAmount === '0') {
        throw new Error('No pending withdrawals');
      }

      // Prepare contract method
      const method = contract.methods.withdraw();

      // Send transaction
      const txHash = await web3Service.sendTransaction(method);
      
      // Wait for confirmation
      await web3Service.waitForTransaction(txHash);

      const amountInEth = web3Service.web3Instance!.utils.fromWei(pendingAmount, 'ether');
      console.log(`Withdrawal successful. Amount: ${amountInEth} ETH, Tx: ${txHash}`);
      return txHash;

    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  /**
   * Get listing details
   */
  async getListing(listingId: string): Promise<MarketplaceListing> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      const listing = await contract.methods.getListing(listingId).call();
      
      return {
        listingId,
        tokenId: listing.tokenId,
        nftContract: listing.nftContract,
        seller: listing.seller,
        price: web3Service.web3Instance!.utils.fromWei(listing.price, 'ether'),
        listingTime: parseInt(listing.listingTime),
        active: listing.active
      };

    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  }

  /**
   * Get auction details
   */
  async getAuction(auctionId: string): Promise<MarketplaceAuction> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      const auction = await contract.methods.getAuction(auctionId).call();
      
      return {
        auctionId,
        tokenId: auction.tokenId,
        nftContract: auction.nftContract,
        seller: auction.seller,
        startingPrice: web3Service.web3Instance!.utils.fromWei(auction.startingPrice, 'ether'),
        currentBid: web3Service.web3Instance!.utils.fromWei(auction.currentBid, 'ether'),
        currentBidder: auction.currentBidder,
        startTime: parseInt(auction.startTime),
        endTime: parseInt(auction.endTime),
        active: auction.active,
        ended: auction.ended
      };

    } catch (error) {
      console.error('Error getting auction:', error);
      throw error;
    }
  }

  /**
   * Get offers for an NFT
   */
  async getOffers(offerId: string): Promise<MarketplaceOffer[]> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      const offers = await contract.methods.getOffers(offerId).call();
      
      return offers.map((offer: any) => ({
        tokenId: offer.tokenId,
        nftContract: offer.nftContract,
        offerer: offer.offerer,
        amount: web3Service.web3Instance!.utils.fromWei(offer.amount, 'ether'),
        expiration: parseInt(offer.expiration),
        active: offer.active
      }));

    } catch (error) {
      console.error('Error getting offers:', error);
      throw error;
    }
  }

  /**
   * Get pending withdrawal amount
   */
  async getPendingWithdrawal(): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      if (!web3Service.currentAccount) {
        throw new Error('Wallet not connected');
      }

      const amount = await contract.methods
        .pendingWithdrawals(web3Service.currentAccount)
        .call();

      return web3Service.web3Instance!.utils.fromWei(amount, 'ether');

    } catch (error) {
      console.error('Error getting pending withdrawal:', error);
      throw error;
    }
  }

  /**
   * Calculate platform fee for a given price
   */
  async calculatePlatformFee(price: string): Promise<string> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      const feePercent = await contract.methods.platformFeePercent().call();
      const priceInWei = web3Service.web3Instance!.utils.toWei(price, 'ether');
      
      // Calculate fee: (price * feePercent) / 10000
      const fee = (BigInt(priceInWei) * BigInt(feePercent)) / BigInt(10000);
      
      return web3Service.web3Instance!.utils.fromWei(fee.toString(), 'ether');

    } catch (error) {
      console.error('Error calculating platform fee:', error);
      throw error;
    }
  }

  /**
   * Get platform fee percentage
   */
  async getPlatformFeePercent(): Promise<number> {
    try {
      const contract = web3Service.marketplaceContractInstance;
      if (!contract) {
        throw new Error('Marketplace contract not initialized');
      }

      const feePercent = await contract.methods.platformFeePercent().call();
      return parseInt(feePercent) / 100; // Convert from basis points to percentage

    } catch (error) {
      console.error('Error getting platform fee:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();