import {Contract} from "web3-eth-contract"
const solc = require("solc");
import fs from "fs";
import {web3} from "./Web3Service"
//const Contract = typeof(new web3.eth.Contract(undefined))
let input = {
    language: 'Solidity',
    sources: {
      'IPFSNFT.sol': {
        content: 'contract C { function f() public { } }'
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

function importer(path:string) {
    return {
        contents: fs.readFileSync('./node_modules/' + path).toString()
    }
}


let sourceCode = fs.readFileSync('src/solidity/contracts/IPFSNFT.sol').toString();
input.sources["IPFSNFT.sol"].content = sourceCode;


let compiledCode = JSON.parse(solc.compile(JSON.stringify(input), {import: importer})) // Solidity 코드 컴파일

let IPFSNFTABI = compiledCode.contracts['IPFSNFT.sol'].IPFSNFT.abi

let byteCode = compiledCode.contracts['IPFSNFT.sol'].IPFSNFT.evm.bytecode.object

//let IPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, undefined,{data: byteCode});

//let IPFSNFTDeployed = IPFSNFTContract.deploy({data: byteCode, arguments: ["test", "tes","0x6b32e1354Fd9c73EA18e88db4cb745610A7E2eB3"]});


// 새 NFT 컨트랙트 생성
function makeNewIPFSNFTContractAsync(argument: string[])
{
  let IPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, undefined,{data: byteCode});
  let IPFSNFTDeployed = IPFSNFTContract.deploy({data: byteCode, arguments: argument});
  return IPFSNFTDeployed.send({from: web3.eth.defaultAccount});
}

// 컨트랙트 주소로 컨트랙트 가져오기
function getIPFSNFTContract(address: string)
{
  let IPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, address,{data: byteCode});
  return IPFSNFTContract;
}

function getIPFSHash(contract: Contract)
{
  return contract.methods._dataURI().call();
}

let IPFSNFTContract = {
  makeNewContractAsync : makeNewIPFSNFTContractAsync,
  getContract : getIPFSNFTContract,
  getIPFSHash : getIPFSHash
}

export class SolidityService
{
  public contracts : {[name:string]: {[name:string]:Function}};
  constructor(

  )
  {
    this.contracts["IPFSNFT"] = IPFSNFTContract;
  }
}

export const solidityService = new SolidityService();