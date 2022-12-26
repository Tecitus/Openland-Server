// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721 NFT 표준 구현
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; // https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable NFT 토큰을 여러개로 생성 가능
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPFSNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    //mapping(string => uint8) public existingURIs;
    uint256 public cost = 0.000001 ether;
    uint256 public maxSupply = 100;
    uint256 public supply;
    string public baseURI = "https://ipfs.io/ipfs/"; // ipfs://
    string public dataURI; // ipfs의 해시
    //string public title;

    struct Offer
    {
        uint256 cost;
        uint8 amount;
    }

    mapping(uint8 => uint256) listing;
    mapping(address => Offer) offers;

    event Sale(
        uint256 id,
        address indexed from,
        address indexed to,
        uint256 cost,
        string metadataURI,
        uint256 timestamp,
        uint8 stype,
        uint8 amount
    );

    event ListAccepted(
        uint256 id,
        address indexed from,
        address indexed to,
        uint256 cost
    );

    event OfferAccepted(
        uint256 id,
        address indexed from,
        address indexed to,
        uint256 cost
    );


    constructor(
        string memory _name, // 최대 64자
        string memory _symbol, //보통 3~4자리 대문자
        string memory _datauRI,
        uint8 _maxSupply,
        address marketaddress
    ) ERC721(_name, _symbol) {
        supply = totalSupply();
        dataURI = _datauRI;
        maxSupply = _maxSupply;
        setApprovalForAll(marketaddress, true);
    }

    function payToMint() public payable {
        require(supply <= maxSupply, "Sorry, all NFTs have been minted!");
        require(msg.value > 0 ether, "Ether too low for minting!");
        //require(msg.sender != owner(), "This is not permitted!");

        supply += 1;

        _safeMint(msg.sender, supply);
        emit Sale(supply, msg.sender, owner(), msg.value, tokenURI(supply),block.timestamp, 0, 1);
        //emit Sale(supply, msg.sender, owner(), msg.value, tokenURI(supply),block.timestamp);
    }

    function makeListing(uint8 tokenid, uint256 cost, address market) external
    {
        require(ownerOf(tokenid) == msg.sender, "Sender is not permitted");
        approve(market, tokenid);
        listing[tokenid] = cost;
        emit Sale(tokenid, msg.sender, address(0), cost, tokenURI(tokenid),block.timestamp, 1, 1);
        //emit Listed(tokenid, msg.sender, cost);
    }

    function makeOffer(uint256 cost, uint8 amount, address payable marketaddress) external payable
    {
        offers[msg.sender] = Offer(cost, amount);
        sendMoneyTo(marketaddress, (cost + 500000) * amount );
        emit Sale(0, address(0), msg.sender, cost, "",block.timestamp, 2, amount);
    }

    function acceptListing(uint8 tokenid, address payable marketaddress) external payable
    {
        uint256 cost = listing[tokenid];
        require(msg.value > cost, "Value is lower than cost.");
        address preowner = ownerOf(tokenid);
        //safeTransferFrom(preowner, msg.sender, tokenid);
        sendMoneyTo(marketaddress, cost + 500000);
        delete listing[tokenid];
        //emit Sale(tokenid, preowner, msg.sender, cost, tokenURI(tokenid), block.timestamp, 13);
        emit ListAccepted(tokenid, preowner, msg.sender, cost);
    }

    function acceptOffer(uint8 tokenid, address to, address market) external
    {
        require(msg.sender == ownerOf(tokenid), "Sender is not owner.");
        approve(market, tokenid);
        Offer memory offer = offers[to];
        //safeTransferFrom(preowner, msg.sender, tokenid);
        offers[to].amount -= 1;
        if(offers[to].amount == 0)
        {
            delete offers[to];
        }
        //emit Sale(tokenid, preowner, msg.sender, cost, tokenURI(tokenid), block.timestamp, 13);
        emit OfferAccepted(tokenid, msg.sender, to, offer.cost);
    }

    function processListing(uint8 tokenid, address payable to, uint256 cost) external payable
    {
        address preowner = ownerOf(tokenid);
        safeTransferFrom(preowner, to, tokenid);
        sendMoneyTo(to, cost);
        emit Sale(tokenid, preowner, to, cost, tokenURI(tokenid), block.timestamp, 13, 1);
    }

    function processOffer(uint8 tokenid, address to, uint256 cost) external payable
    {
        address payable preowner = payable(ownerOf(tokenid));
        safeTransferFrom(preowner, to, tokenid);
        sendMoneyTo(preowner, cost);
        emit Sale(tokenid, preowner, to, cost, tokenURI(tokenid), block.timestamp, 23, 1);
    }

    function TransferNft(uint8 tokenid, address to) external
    {
        address preowner = ownerOf(tokenid);
        safeTransferFrom(preowner, to, tokenid);
        emit Sale(tokenid, preowner, to, 0, tokenURI(tokenid), block.timestamp, 4, 1);
    }

    function concat(string memory str) internal view returns (string memory) {
        return string(abi.encodePacked(baseURI, "", str));
    }

    function sendMoneyTo(address payable to, uint256 amount) internal {
        (bool success1, ) = to.call{value: amount}("");
        require(success1);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function _dataURI() internal view virtual returns (string memory) {
        return dataURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        return string(abi.encodePacked(_baseURI(), _dataURI()));
    }
}