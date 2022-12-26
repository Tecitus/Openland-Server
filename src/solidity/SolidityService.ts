import {Contract} from "web3-eth-contract"
//@ts-ignore
import BigNumber from 'big-number'
/* eslint-disable */
const solc = require("solc");
import fs from "fs";
import {web3, web3Service, sendTransaction, signAndSendTransaction} from "./Web3Service"
import {assetRepository} from "../asset/asset.repository";
import { assetService } from "../asset/asset.service";
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

export const IPFSNFTABI = compiledCode.contracts['IPFSNFT.sol'].IPFSNFT.abi

export const byteCode = compiledCode.contracts['IPFSNFT.sol'].IPFSNFT.evm.bytecode.object



// 새 NFT 컨트랙트 생성
async function makeNewIPFSNFTContractAsync(argument: any[], address:string,key:string = web3Service.key,txcount:number= undefined)
{
  const iPFSNFTContract = new web3.eth.Contract(IPFSNFTABI, undefined,{data: byteCode});
  const iPFSNFTDeployed = iPFSNFTContract.deploy({data: byteCode, arguments: argument});

  return await signAndSendTransaction(undefined, iPFSNFTDeployed.encodeABI(), 0,key,undefined, txcount);
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

async function mintIPFSNFT(contract: Contract, address:string,key:string = web3Service.key)
{
  try{
    let result = contract.methods.payToMint();
    result = await sendTransaction(result,8000000,key);
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
  let result = await contract.methods.safeTransferFrom(from,to,tokenid).send({from: from, gas:6721975, value:0});
}

async function wrapper()
{
  let assets = await assetRepository.getAllAssets();
  for(let a of assets)
  {
    let contract = getIPFSNFTContract(a.address);
    contract.events.Sale(()=>{return {};}).on('data',async (event:any)=>{
      const data = event.returnValues;
      if(data.stype == 0) // Mint
      {
          const options = {
              tokenId:data.id,
              creator:a.creator,
              owneraddress:data.to,
              assetid: a.id,
              to:data.to,
              type:0,
              tokenindex:data.id,
              timestamp: Number(data.timestamp * 1000),
              done:1
          };
          await assetService.minting(options);
      }
      else if(data.stype == 1) // List
      {
          await assetService.createListActivity(a.id, data.id, data.from, data.cost);
      }
      else if(data.stype == 2) // Offer
      {
          await assetService.createOfferActivity(a.id, undefined, data.to, data.cost);
      }
      else if(data.stype == 13) // ListSale
      {
          const ac = (await assetRepository.findActivityData({
              type:1,
              tokenindex:data.id,
              assetid:a.id,
              from:data.from,
              done:false
          },1))[0];
          await assetService.acceptListActivity(ac.id, data.to);
      }
      else if(data.stype == 23) // OfferSale
      {
          const ac = (await assetRepository.findActivityData({
              type:2,
              assetid:a.id,
              to:data.to,
              done:false
          },1))[0];
          await assetService.acceptOfferActivity(ac.id, data.from, data.id);
      }
      else if(data.stype == 4) // Transfer
      {
          const at = await assetService.getAssetToken(a.id, data.id);
          await assetService.transferOwnership(at, data.to);
      }
  });
  contract.events.ListAccepted(()=>{return {};}).on('data', async (event:any)=>{
      const data = event.returnValues;
      let tx = contract.methods.processListing(data.id,data.to, data.cost)
      sendTransaction(tx, data.cost+800000, web3Service.key);//.send({from:web3Service.address, gas:6721975, value:data.cost+8000000});
  });

  contract.events.OfferAccepted(()=>{return {};}).on('data', async (event:any)=>{
      const data = event.returnValues;
      let tx = contract.methods.processOffer(data.id,data.to, data.cost)
      sendTransaction(tx, data.cost+800000, web3Service.key);//.send({from:web3Service.address, gas:6721975, value:data.cost+8000000});
  });
  }
}

wrapper();

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