import {Contract} from "web3-eth-contract"
//@ts-ignore
import BigNumber from 'big-number'
/* eslint-disable */
const solc = require("solc");
//import solc from 'solc';
import fs from "fs";
import {web3} from "./Web3Service"
//const Contract = typeof(new web3.eth.Contract(undefined))
const input = {
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


const sourceCode = fs.readFileSync('src/solidity/contracts/IPFSNFT.sol').toString();
input.sources["IPFSNFT.sol"].content = sourceCode;


const compiledCode = JSON.parse(solc.compile(JSON.stringify(input), {import: importer})) // Solidity 코드 컴파일

const IPFSNFTABI = compiledCode.contracts['IPFSNFT.sol'].IPFSNFT.abi

const byteCode = compiledCode.contracts['IPFSNFT.sol'].IPFSNFT.evm.bytecode.object

//let IPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, undefined,{data: byteCode});

//let IPFSNFTDeployed = IPFSNFTContract.deploy({data: byteCode, arguments: ["test", "tes","0x6b32e1354Fd9c73EA18e88db4cb745610A7E2eB3"]});


// 새 NFT 컨트랙트 생성
async function makeNewIPFSNFTContractAsync(argument: any[], address:string)
{
  console.log(argument);
  const iPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, undefined,{data: byteCode});
  const iPFSNFTDeployed = iPFSNFTContract.deploy({data: byteCode, arguments: argument});
  //console.log(web3.eth.defaultAccount)
  return iPFSNFTDeployed.send({from: address, gas:6721975});
}

// 컨트랙트 주소로 컨트랙트 가져오기
function getIPFSNFTContract(address: string)
{
  const iPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, address,{data: byteCode});
  return iPFSNFTContract;
}

function getContractOwner(contract:Contract)
{
  return contract.methods._owner().call();
}

function getIPFSHash(contract: Contract)
{
  return contract.methods._dataURI().call();
}

async function mintIPFSNFT(contract: Contract, address:string)
{
  try{
    let result = await contract.methods.payToMint(web3.eth.defaultAccount).
    send({from: address, gas:6721975, value: 8000000})//@ts-ignore 47000000000
    console.log(result.events["Transfer"].returnValues);
    return result;
  }
  catch(err)
  {
    console.log(err);
  }
}

async function sendMoneyTo(from:string,to:string,amount:number){
  return await web3.eth.sendTransaction({from:from,to:to,value:web3.utils.toWei(amount.toString(),"ether")});
}

async function safeTransferFrom(contract: Contract, from:string, to:string, tokenid:number)
{
  console.log(from, to, tokenid);
        let result = await contract.methods.safeTransferFrom(from,to,tokenid).send({from: from, gas:6721975, value:0});
        /*
        result = result.startsWith('0x') ? result : `0x${result}`
        const reason = web3.utils.toAscii(result.substr(138))
        console.log('Revert reason:', reason)
        console.log(result.events["error"]);
        */
}

const iPFSNFTContract = {
  makeNewContractAsync : makeNewIPFSNFTContractAsync,
  getContract : getIPFSNFTContract,
  getIPFSHash : getIPFSHash,
  mintIPFSNFT : mintIPFSNFT,
  sendMoneyTo : sendMoneyTo,
  safeTransferFrom : safeTransferFrom
}

export class SolidityService
{
  public contracts :any// : {[name:string]: {[name:string]:(para:any)=>any}};
  constructor(
  )
  {
    this.contracts = {};
    this.contracts["IPFSNFT"] = iPFSNFTContract;
  }
}

export const solidityService = new SolidityService();