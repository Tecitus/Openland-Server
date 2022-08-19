// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721 NFT 표준 구현
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; // https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable NFT 토큰을 여러개로 생성 가능
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPFSNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    //mapping(string => uint8) public existingURIs;
    uint256 public cost = 0.01 ether;
    uint256 public maxSupply = 100;
    uint256 public supply;
    string public baseURI = "https://ipfs.io/ipfs/"; // ipfs://
    string public dataURI; // ipfs의 해시
    //string public title;

    event Sale(
        uint256 id,
        address indexed from,
        address indexed to,
        uint256 cost,
        string metadataURI,
        uint256 timestamp
    );

    struct SaleStruct {
        uint256 id;
        address from;
        address to;
        uint256 cost;
        string title;
        uint256 timestamp;
    }

    SaleStruct[] minted;

    constructor(
        string memory _name, // 최대 64자
        string memory _symbol, //보통 3~4자리 대문자
        string memory _datauRI,
        uint8 _maxSupply
    ) ERC721(_name, _symbol) {
        supply = totalSupply();
        dataURI = _datauRI;
        maxSupply = _maxSupply;
    }

    function payToMint() public payable {
        require(supply <= maxSupply, "Sorry, all NFTs have been minted!");
        require(msg.value > 0 ether, "Ether too low for minting!");
        require(msg.sender != owner(), "This is not permitted!");

        supply += 1;

        sendMoneyTo(owner(), msg.value);

        minted.push(
            SaleStruct(
                supply,
                msg.sender,
                owner(),
                msg.value,
                name(),
                block.timestamp
            )
        );

        _safeMint(msg.sender, supply);
        emit Sale(supply, msg.sender, owner(), msg.value, tokenURI(supply), block.timestamp);
    }

    //maxSupply 만큼 토큰 민팅
    function mintAll() public payable
    {
        for(uint i = supply; i < maxSupply; i++)
        {
            payToMint();
        }
    }

    function getAllNFTs() public view returns (SaleStruct[] memory) {
        return minted;
    }
    
    function getAnNFTs(uint256 tokenId) public view returns (SaleStruct memory) {
        return minted[tokenId - 1];
    }

    function concat(string memory str) internal view returns (string memory) {
        return string(abi.encodePacked(baseURI, "", str));
    }

    function sendMoneyTo(address to, uint256 amount) internal {
        (bool success1, ) = payable(to).call{value: amount}("");
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