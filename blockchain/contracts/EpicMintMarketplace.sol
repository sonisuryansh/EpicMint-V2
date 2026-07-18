// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title EpicMintMarketplace
 * @dev Decentralized marketplace for NFT trading
 * Features: Auctions, Fixed price sales, Offers, Royalties
 */
contract EpicMintMarketplace is ReentrancyGuard, Ownable, Pausable {
    
    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFeePercent = 250;
    
    // Marketplace listing
    struct Listing {
        uint256 tokenId;
        address nftContract;
        address payable seller;
        uint256 price;
        uint256 listingTime;
        bool active;
    }
    
    // Auction structure
    struct Auction {
        uint256 tokenId;
        address nftContract;
        address payable seller;
        uint256 startingPrice;
        uint256 currentBid;
        address payable currentBidder;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool ended;
    }
    
    // Offer structure
    struct Offer {
        uint256 tokenId;
        address nftContract;
        address payable offerer;
        uint256 amount;
        uint256 expiration;
        bool active;
    }
    
    // Mappings
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => Auction) public auctions;
    mapping(bytes32 => Offer[]) public offers;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Events
    event ItemListed(
        bytes32 indexed listingId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address seller,
        uint256 price
    );
    
    event ItemSold(
        bytes32 indexed listingId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address seller,
        address buyer,
        uint256 price
    );
    
    event AuctionCreated(
        bytes32 indexed auctionId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address seller,
        uint256 startingPrice,
        uint256 duration
    );
    
    event BidPlaced(
        bytes32 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        bytes32 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );
    
    event OfferMade(
        bytes32 indexed offerId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address offerer,
        uint256 amount
    );
    
    event OfferAccepted(
        bytes32 indexed offerId,
        uint256 indexed tokenId,
        address indexed nftContract,
        address seller,
        address buyer,
        uint256 amount
    );

    /**
     * @dev Create a fixed price listing
     */
    function createListing(
        uint256 tokenId,
        address nftContract,
        uint256 price
    ) external whenNotPaused returns (bytes32) {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) || 
                IERC721(nftContract).getApproved(tokenId) == address(this), "Marketplace not approved");

        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: payable(msg.sender),
            price: price,
            listingTime: block.timestamp,
            active: true
        });

        emit ItemListed(listingId, tokenId, nftContract, msg.sender, price);
        return listingId;
    }

    /**
     * @dev Buy item from fixed price listing
     */
    function buyItem(bytes32 listingId) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(IERC721(listing.nftContract).ownerOf(listing.tokenId) == listing.seller, "Seller no longer owns token");

        listing.active = false;

        // Calculate fees
        uint256 platformFee = (listing.price * platformFeePercent) / 10000;
        uint256 sellerAmount = listing.price - platformFee;

        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // Transfer payments
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        listing.seller.transfer(sellerAmount);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit ItemSold(listingId, listing.tokenId, listing.nftContract, listing.seller, msg.sender, listing.price);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;
    }

    /**
     * @dev Create an auction
     */
    function createAuction(
        uint256 tokenId,
        address nftContract,
        uint256 startingPrice,
        uint256 duration
    ) external whenNotPaused returns (bytes32) {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(duration >= 3600, "Auction duration must be at least 1 hour");
        require(duration <= 7 days, "Auction duration cannot exceed 7 days");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) || 
                IERC721(nftContract).getApproved(tokenId) == address(this), "Marketplace not approved");

        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        auctions[auctionId] = Auction({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: payable(msg.sender),
            startingPrice: startingPrice,
            currentBid: 0,
            currentBidder: payable(address(0)),
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            active: true,
            ended: false
        });

        emit AuctionCreated(auctionId, tokenId, nftContract, msg.sender, startingPrice, duration);
        return auctionId;
    }

    /**
     * @dev Place a bid on an auction
     */
    function placeBid(bytes32 auctionId) external payable nonReentrant whenNotPaused {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        
        uint256 minBid = auction.currentBid > 0 ? auction.currentBid + ((auction.currentBid * 5) / 100) : auction.startingPrice;
        require(msg.value >= minBid, "Bid too low");

        // Return previous bid
        if (auction.currentBidder != address(0)) {
            pendingWithdrawals[auction.currentBidder] += auction.currentBid;
        }

        auction.currentBid = msg.value;
        auction.currentBidder = payable(msg.sender);

        // Extend auction if bid placed in last 15 minutes
        if (auction.endTime - block.timestamp < 900) {
            auction.endTime = block.timestamp + 900;
        }

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev End an auction
     */
    function endAuction(bytes32 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        require(!auction.ended, "Auction already ended");

        auction.active = false;
        auction.ended = true;

        if (auction.currentBidder != address(0)) {
            // Transfer NFT to winner
            IERC721(auction.nftContract).safeTransferFrom(
                auction.seller, 
                auction.currentBidder, 
                auction.tokenId
            );

            // Calculate and transfer payments
            uint256 platformFee = (auction.currentBid * platformFeePercent) / 10000;
            uint256 sellerAmount = auction.currentBid - platformFee;

            if (platformFee > 0) {
                payable(owner()).transfer(platformFee);
            }
            auction.seller.transfer(sellerAmount);

            emit AuctionEnded(auctionId, auction.currentBidder, auction.currentBid);
        } else {
            emit AuctionEnded(auctionId, address(0), 0);
        }
    }

    /**
     * @dev Make an offer on an NFT
     */
    function makeOffer(
        uint256 tokenId,
        address nftContract,
        uint256 expiration
    ) external payable whenNotPaused returns (bytes32) {
        require(msg.value > 0, "Offer must be greater than 0");
        require(expiration > block.timestamp, "Expiration must be in the future");
        require(expiration <= block.timestamp + 30 days, "Expiration too far in future");

        bytes32 offerId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));

        offers[offerId].push(Offer({
            tokenId: tokenId,
            nftContract: nftContract,
            offerer: payable(msg.sender),
            amount: msg.value,
            expiration: expiration,
            active: true
        }));

        emit OfferMade(offerId, tokenId, nftContract, msg.sender, msg.value);
        return offerId;
    }

    /**
     * @dev Accept an offer
     */
    function acceptOffer(bytes32 offerId, uint256 offerIndex) external nonReentrant whenNotPaused {
        Offer storage offer = offers[offerId][offerIndex];
        require(offer.active, "Offer not active");
        require(block.timestamp <= offer.expiration, "Offer has expired");
        require(IERC721(offer.nftContract).ownerOf(offer.tokenId) == msg.sender, "Not token owner");
        require(IERC721(offer.nftContract).isApprovedForAll(msg.sender, address(this)) || 
                IERC721(offer.nftContract).getApproved(offer.tokenId) == address(this), "Marketplace not approved");

        offer.active = false;

        // Transfer NFT
        IERC721(offer.nftContract).safeTransferFrom(msg.sender, offer.offerer, offer.tokenId);

        // Calculate and transfer payments
        uint256 platformFee = (offer.amount * platformFeePercent) / 10000;
        uint256 sellerAmount = offer.amount - platformFee;

        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        payable(msg.sender).transfer(sellerAmount);

        emit OfferAccepted(offerId, offer.tokenId, offer.nftContract, msg.sender, offer.offerer, offer.amount);
    }

    /**
     * @dev Withdraw pending payments
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev Get listing details
     */
    function getListing(bytes32 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @dev Get auction details
     */
    function getAuction(bytes32 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    /**
     * @dev Get offers for a specific NFT
     */
    function getOffers(bytes32 offerId) external view returns (Offer[] memory) {
        return offers[offerId];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }

    /**
     * @dev Pause the marketplace
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}