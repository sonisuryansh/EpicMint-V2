// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title EpicMintNFT
 * @dev NFT Contract for Stories, Comics, and Poems
 * Features: Minting, Marketplace, Royalties, Batch Operations
 */
contract EpicMintNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    // Contract metadata
    string private _contractURI;
    
    // Marketplace functionality
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        uint256 listedAt;
    }
    
    mapping(uint256 => MarketItem) private marketItems;
    mapping(uint256 => bool) private itemsForSale;
    
    // Royalty functionality (EIP-2981)
    struct RoyaltyInfo {
        address recipient;
        uint256 percentage; // Basis points (100 = 1%)
    }
    
    mapping(uint256 => RoyaltyInfo) private _tokenRoyalty;
    uint256 private _defaultRoyaltyPercentage = 250; // 2.5%
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTSold(uint256 indexed tokenId, uint256 price, address indexed seller, address indexed buyer);
    event NFTUnlisted(uint256 indexed tokenId, address indexed seller);
    event RoyaltySet(uint256 indexed tokenId, address indexed recipient, uint256 percentage);
    
    // Modifiers
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "EpicMintNFT: Token does not exist");
        _;
    }
    
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "EpicMintNFT: Not token owner");
        _;
    }

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _tokenIdCounter.increment(); // Start from token ID 1
    }

    /**
     * @dev Mint a new NFT
     * @param to Address to mint the NFT to
     * @param tokenURI Metadata URI for the NFT
     * @param royaltyRecipient Address to receive royalties
     * @param royaltyPercentage Royalty percentage in basis points
     */
    function mintNFT(
        address to,
        string memory tokenURI,
        address royaltyRecipient,
        uint256 royaltyPercentage
    ) public whenNotPaused returns (uint256) {
        require(to != address(0), "EpicMintNFT: Cannot mint to zero address");
        require(bytes(tokenURI).length > 0, "EpicMintNFT: Token URI cannot be empty");
        require(royaltyPercentage <= 1000, "EpicMintNFT: Royalty percentage too high"); // Max 10%

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Set royalty info
        if (royaltyRecipient != address(0)) {
            _setTokenRoyalty(tokenId, royaltyRecipient, royaltyPercentage);
        }

        emit NFTMinted(tokenId, to, tokenURI);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs
     */
    function batchMintNFT(
        address[] memory recipients,
        string[] memory tokenURIs,
        address[] memory royaltyRecipients,
        uint256[] memory royaltyPercentages
    ) external whenNotPaused returns (uint256[] memory) {
        require(recipients.length == tokenURIs.length, "EpicMintNFT: Arrays length mismatch");
        require(recipients.length == royaltyRecipients.length, "EpicMintNFT: Arrays length mismatch");
        require(recipients.length == royaltyPercentages.length, "EpicMintNFT: Arrays length mismatch");
        require(recipients.length <= 100, "EpicMintNFT: Too many tokens to mint");

        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mintNFT(
                recipients[i],
                tokenURIs[i],
                royaltyRecipients[i],
                royaltyPercentages[i]
            );
        }
        
        return tokenIds;
    }

    /**
     * @dev List NFT for sale
     */
    function listNFT(uint256 tokenId, uint256 price) 
        external 
        tokenExists(tokenId) 
        onlyTokenOwner(tokenId) 
        whenNotPaused 
    {
        require(price > 0, "EpicMintNFT: Price must be greater than 0");
        require(!itemsForSale[tokenId], "EpicMintNFT: Token already listed");

        // Transfer token to contract for escrow
        _transfer(msg.sender, address(this), tokenId);
        
        marketItems[tokenId] = MarketItem({
            tokenId: tokenId,
            seller: payable(msg.sender),
            owner: payable(address(this)),
            price: price,
            sold: false,
            listedAt: block.timestamp
        });
        
        itemsForSale[tokenId] = true;
        
        emit NFTListed(tokenId, price, msg.sender);
    }

    /**
     * @dev Buy NFT from marketplace
     */
    function buyNFT(uint256 tokenId) 
        external 
        payable 
        tokenExists(tokenId) 
        nonReentrant 
        whenNotPaused 
    {
        require(itemsForSale[tokenId], "EpicMintNFT: Token not for sale");
        
        MarketItem storage item = marketItems[tokenId];
        require(!item.sold, "EpicMintNFT: Token already sold");
        require(msg.value >= item.price, "EpicMintNFT: Insufficient payment");

        // Calculate royalty
        (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, item.price);
        
        // Calculate platform fee (2.5%)
        uint256 platformFee = (item.price * 250) / 10000;
        uint256 sellerAmount = item.price - royaltyAmount - platformFee;

        // Mark as sold
        item.sold = true;
        itemsForSale[tokenId] = false;

        // Transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId);

        // Transfer payments
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            payable(royaltyRecipient).transfer(royaltyAmount);
        }
        
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        item.seller.transfer(sellerAmount);

        // Refund excess payment
        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }

        emit NFTSold(tokenId, item.price, item.seller, msg.sender);
    }

    /**
     * @dev Unlist NFT from marketplace
     */
    function unlistNFT(uint256 tokenId) 
        external 
        tokenExists(tokenId) 
        whenNotPaused 
    {
        require(itemsForSale[tokenId], "EpicMintNFT: Token not listed");
        
        MarketItem storage item = marketItems[tokenId];
        require(item.seller == msg.sender, "EpicMintNFT: Not the seller");
        require(!item.sold, "EpicMintNFT: Token already sold");

        // Return NFT to seller
        _transfer(address(this), msg.sender, tokenId);
        
        // Remove from marketplace
        itemsForSale[tokenId] = false;
        delete marketItems[tokenId];

        emit NFTUnlisted(tokenId, msg.sender);
    }

    /**
     * @dev Set royalty information for a token
     */
    function _setTokenRoyalty(uint256 tokenId, address recipient, uint256 percentage) internal {
        require(recipient != address(0), "EpicMintNFT: Invalid royalty recipient");
        require(percentage <= 1000, "EpicMintNFT: Royalty percentage too high");

        _tokenRoyalty[tokenId] = RoyaltyInfo(recipient, percentage);
        emit RoyaltySet(tokenId, recipient, percentage);
    }

    /**
     * @dev Get royalty information (EIP-2981)
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        public 
        view 
        returns (address, uint256) 
    {
        RoyaltyInfo memory royalty = _tokenRoyalty[tokenId];
        
        if (royalty.recipient == address(0)) {
            return (address(0), 0);
        }
        
        uint256 royaltyAmount = (salePrice * royalty.percentage) / 10000;
        return (royalty.recipient, royaltyAmount);
    }

    /**
     * @dev Get market item details
     */
    function getMarketItem(uint256 tokenId) 
        external 
        view 
        returns (MarketItem memory) 
    {
        return marketItems[tokenId];
    }

    /**
     * @dev Check if token is for sale
     */
    function isTokenForSale(uint256 tokenId) external view returns (bool) {
        return itemsForSale[tokenId];
    }

    /**
     * @dev Get all tokens for sale
     */
    function getTokensForSale() external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter.current() - 1;
        uint256 forSaleCount = 0;
        
        // Count tokens for sale
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (itemsForSale[i] && !marketItems[i].sold) {
                forSaleCount++;
            }
        }
        
        // Create array of tokens for sale
        uint256[] memory tokensForSale = new uint256[](forSaleCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (itemsForSale[i] && !marketItems[i].sold) {
                tokensForSale[index] = i;
                index++;
            }
        }
        
        return tokensForSale;
    }

    /**
     * @dev Get tokens owned by an address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter.current() - 1;
        uint256 ownedCount = 0;
        
        // Count owned tokens
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                ownedCount++;
            }
        }
        
        // Create array of owned tokens
        uint256[] memory ownedTokens = new uint256[](ownedCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                ownedTokens[index] = i;
                index++;
            }
        }
        
        return ownedTokens;
    }

    /**
     * @dev Get current token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    /**
     * @dev Set contract URI
     */
    function setContractURI(string memory contractURI_) external onlyOwner {
        _contractURI = contractURI_;
    }

    /**
     * @dev Get contract URI
     */
    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "EpicMintNFT: No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        
        // Clear marketplace listing
        if (itemsForSale[tokenId]) {
            itemsForSale[tokenId] = false;
            delete marketItems[tokenId];
        }
        
        // Clear royalty info
        delete _tokenRoyalty[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}