// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EpicMintNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    ERC2981,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    uint256 private _nextTokenId = 1;

    string private _contractURI;

    mapping(address => bool) public verifiedCreators;

    event CreatorVerified(address indexed creator);

    event CreatorRevoked(address indexed creator);

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed owner,
        string tokenURI
    );

    constructor(
        string memory name_,
        string memory symbol_,
        string memory contractURI_
    )
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {
        _contractURI = contractURI_;
    }

    modifier onlyVerifiedCreator() {
        require(
            verifiedCreators[msg.sender],
            "Creator not verified"
        );
        _;
    }
        function verifyCreator(address creator)
        external
        onlyOwner
    {
        verifiedCreators[creator] = true;

        emit CreatorVerified(creator);
    }

    function revokeCreator(address creator)
        external
        onlyOwner
    {
        verifiedCreators[creator] = false;

        emit CreatorRevoked(creator);
    }

    function isVerifiedCreator(address creator)
        external
        view
        returns (bool)
    {
        return verifiedCreators[creator];
    }
        /**
     * @dev Mint a new NFT
     */
    function mintNFT(
        address to,
        string memory metadataURI,
        address royaltyReceiver,
        uint96 royaltyFee
    )
        external
        onlyVerifiedCreator
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(to != address(0), "Invalid receiver");
        require(bytes(metadataURI).length > 0, "Metadata required");

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        if (royaltyReceiver != address(0) && royaltyFee > 0) {
            require(
                royaltyFee <= _feeDenominator(),
                "Royalty too high"
            );

            _setTokenRoyalty(
                tokenId,
                royaltyReceiver,
                royaltyFee
            );
        }

        emit NFTMinted(
            tokenId,
            msg.sender,
            to,
            metadataURI
        );

        return tokenId;
    }

    /**
     * @dev Update royalty for owned NFT
     */
    function setRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        require(
            feeNumerator <= _feeDenominator(),
            "Royalty too high"
        );

        _setTokenRoyalty(
            tokenId,
            receiver,
            feeNumerator
        );
    }

    /**
     * @dev Remove royalty
     */
    function resetRoyalty(
        uint256 tokenId
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        _resetTokenRoyalty(tokenId);
    }

    /**
     * @dev Collection metadata URI
     */
    function contractURI()
        external
        view
        returns (string memory)
    {
        return _contractURI;
    }

    /**
     * @dev Update collection metadata
     */
    function setContractURI(
        string memory newURI
    )
        external
        onlyOwner
    {
        _contractURI = newURI;
    }

    /**
     * @dev Pause contract
     */
    function pause()
        external
        onlyOwner
    {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause()
        external
        onlyOwner
    {
        _unpause();
    }
        /**
     * @dev Required override for ERC721URIStorage
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Required override for ERC2981
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Prevent transfers while paused
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721)
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}