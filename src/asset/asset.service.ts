import { AssetRepository, assetRepository } from "./asset.repository";
import { Asset, Activity } from "./asset";
import {AssetToken} from "./assettoken";
import { isThisMinute } from "date-fns";
import {User} from "../user/user"; 
import { ipfsService } from "../common/ipfs.service";
import {fileStorageService} from "../common/filestorage.service";
import { solidityService } from "../solidity/SolidityService";
import {Contract} from "web3-eth-contract"
import {web3, web3Service,sendTransaction} from "../solidity/Web3Service"
import { userService } from "../user/user.service";
import { metamaskService } from "../metamask/metamask.service";
import { WebSocket } from "ws";
export class AssetCreationOption
{
    constructor(
        public name: string,
        public symbol: string,
        public description: string,
        public creater: number, // 유저 또는 유저의 DB id
        public tokennumber : number, // 생성하려는 NFT 토큰 갯수
        public image : Buffer, // 파일의 버퍼
        public collectionid : number,
        public creatoraddress:string
    )
    {
    }
}

export class AssetSearchOption
{
    constructor(
        public name?: string,
        public symbol?: string,
        public description?: string,
        public creater?: number, // 유저 또는 유저의 DB id
        public amount? : number, // 가져올 갯수
        public index? : number // 페이지 번호
    )
    {
    }
}

export class AssetService
{
    constructor(private AssetRepository: AssetRepository) {
    }

    //에셋의 id로 에셋 찾기
    public async getAssetData(id: number): Promise<Asset> {
        try {
            return await this.AssetRepository.getAssetData(id);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }   

    //주어진 옵션을 만족하는 에셋들을 반환
    public async searchAssets(option:object): Promise<Asset[]>
    {
        try {
            return await this.AssetRepository.findAssetData(option);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    //target의 소유권을 to에게 이동, 성공시 true 반환, 아니면 false
    public async transferOwnership(target:AssetToken, to:string): Promise<boolean>
    {
        const asset = await assetRepository.getAssetData(target.assetid);
        //const contract = await solidityService.contracts["IPFSNFT"].getContract(asset.address);

        //await solidityService.contracts["IPFSNFT"].safeTransferFrom(contract, target.owneraddress, to, target.index);

        const ac = new Activity();
        ac.assetid = target.assetid;
        ac.cost = 0;
        ac.done = true;
        ac.from = target.owneraddress;
        ac.to = to;
        ac.tokenindex = target.index;
        ac.type = 4;

        await assetRepository.createActivity(ac);
        target.owneraddress = to;

        const owner = await metamaskService.getMetamaskData(target.owneraddress);
        if(owner) {
            target.ownerid = owner.userid;
        }
        else
            target.assetid = null;

        await assetRepository.updateAssetToken(target);

        return true;
    }

    // 새 에셋 생성
    // 업로드 받은 파일을 IPFS에 업로드 하고 IPFS URI를 받아옴
    // 받아온 URI와 주어진 데이터를 통해 NFT를 생성
    // 생성된 NFT 정보를 DB에 저장
    public async createNewAsset(option: AssetCreationOption, key:string,txcount:number=undefined): Promise<void>
    {
        const cid = await ipfsService.uploadFile(option.image); //ipfs에 파일 업로드
        //console.log(cid);

        if(!option.creatoraddress)
            option.creatoraddress = (await metamaskService.getMetamaskDataWithUserId(option.creater))[0].address;

        const receipt = await solidityService.contracts["IPFSNFT"].makeNewContractAsync([option.name,option.symbol,cid,Number(option.tokennumber),web3Service.address],option.creatoraddress,key);
        const asset = new Asset();
        const nftcontract : Contract = await solidityService.contracts["IPFSNFT"].getContract(receipt.contractAddress);
        asset.name = option.name;
        asset.symbol = option.symbol;
        asset.description = option.description;
        asset.totaltokens = option.tokennumber;
        asset.creator = option.creater;
        asset.collectionid = option.collectionid;
        asset.ipfshash = cid;
        asset.address = nftcontract.options.address; // 컨트랙트 주소
        const realasset = (await assetRepository.createAsset(asset));

        nftcontract.events.Sale(()=>{return {};}).on('data',async (event:any)=>{
            console.log(event);
            const data = event.returnValues;
            if(data.stype == 0) // Mint
            {
                const options = {
                    tokenId:data.id,
                    creator:option.creater,
                    owneraddress:option.creatoraddress,
                    assetid: realasset.id,
                    to:option.creatoraddress,
                    type:0,
                    tokenindex:data.id,
                    timestamp: Number(data.timestamp),
                    done:1
                };
                await this.minting(options);
            }
            else if(data.stype == 1) // List
            {
                await this.createListActivity(realasset.id, data.id, data.from, data.cost);
            }
            else if(data.stype == 2) // Offer
            {
                await this.createOfferActivity(realasset.id, undefined, data.to, data.cost);
            }
            else if(data.stype == 13) // ListSale
            {
                const ac = (await assetRepository.findActivityData({
                    type:1,
                    tokenindex:data.id,
                    assetid:realasset.id,
                    from:data.from,
                    done:false
                },1))[0];
                await this.acceptListActivity(ac.id, data.to);
            }
            else if(data.stype == 23) // OfferSale
            {
                const ac = (await assetRepository.findActivityData({
                    type:2,
                    assetid:realasset.id,
                    to:data.to,
                    done:false
                },1))[0];
                await this.acceptOfferActivity(ac.id, data.from, data.id);
            }
            else if(data.stype == 4) // Transfer
            {
                const at = await this.getAssetToken(realasset.id, data.id);
                await this.transferOwnership(at, data.to);
            }
        }).on("connected", function(subscriptionId:any){
            console.log('SubID: ',subscriptionId);
        }).on('changed', function(event:any){
            //Do something when it is removed from the database.
        }).on('error', function(error:any, receipt:any) {
            console.log('Error:', error, receipt);
        });
        nftcontract.events.ListAccepted(()=>{return {};}).on('data', async (event:any)=>{
            console.log(event);
            const data = event.returnValues;
            const tx = nftcontract.methods.processListing(data.id,data.to, data.cost)
            //.send({from:web3Service.address, gas:6721975, value:data.cost+8000000});
            sendTransaction(tx, data.cost+800000, web3Service.key);
        });

        nftcontract.events.OfferAccepted(()=>{return {};}).on('data', async (event:any)=>{
            console.log(event);
            const data = event.returnValues;
            const tx = nftcontract.methods.processOffer(data.id,data.to, data.cost);
            //.send({from:web3Service.address, gas:6721975, value:data.cost+8000000});
            sendTransaction(tx, data.cost+800000, web3Service.key);
        });

        for(let i = 0; i < option.tokennumber ; i++) // tokennumber 만큼 토큰 생성
        {
            const mintednft = await solidityService.contracts["IPFSNFT"].mintIPFSNFT(nftcontract,option.creatoraddress,key);
        }
    }

    public async createAsset(option: any): Promise<Asset>
    {
        if(!option.creatoraddress)
            option.creatoraddress = (await metamaskService.getMetamaskDataWithUserId(option.creator))[0].address;

        const nftcontract : Contract = await solidityService.contracts["IPFSNFT"].getContract(option.address);
        console.log("created");
        console.log(option.creatoraddress);
        const asset = new Asset();
        asset.name = option.name;
        asset.symbol = option.symbol;
        asset.description = option.description;
        asset.totaltokens = option.tokennumber;
        asset.creator = option.creator;
        asset.collectionid = option.collectionid;
        asset.ipfshash = option.hash;
        asset.address = nftcontract.options.address; // 컨트랙트 주소
        const realasset = (await assetRepository.createAsset(asset));

        nftcontract.events.Sale(()=>{return {};}).on('data',async (event:any)=>{
            console.log(event);
            const data = event.returnValues;
            if(data.stype == 0) // Mint
            {
                const options = {
                    tokenId:data.id,
                    creator:option.creator,
                    owneraddress:option.creatoraddress,
                    assetid: realasset.id,
                    to:option.creatoraddress,
                    type:0,
                    tokenindex:data.id,
                    timestamp: Number(data.timestamp * 1000),
                    done:1
                };
                await this.minting(options);
            }
            else if(data.stype == 1) // List
            {
                await this.createListActivity(realasset.id, data.id, data.from, data.cost);
            }
            else if(data.stype == 2) // Offer
            {
                await this.createOfferActivity(realasset.id, undefined, data.to, data.cost);
            }
            else if(data.stype == 13) // ListSale
            {
                const ac = (await assetRepository.findActivityData({
                    type:1,
                    tokenindex:data.id,
                    assetid:realasset.id,
                    from:data.from,
                    done:false
                },1))[0];
                await this.acceptListActivity(ac.id, data.to);
            }
            else if(data.stype == 23) // OfferSale
            {
                const ac = (await assetRepository.findActivityData({
                    type:2,
                    assetid:realasset.id,
                    to:data.to,
                    done:false
                },1))[0];
                await this.acceptOfferActivity(ac.id, data.from, data.id);
            }
            else if(data.stype == 4) // Transfer
            {
                const at = await this.getAssetToken(realasset.id, data.id);
                await this.transferOwnership(at, data.to);
            }
        });
        nftcontract.events.ListAccepted(()=>{return {};}).on('data', async (event:any)=>{
            console.log(event);
            const data = event.returnValues;
            const tx = nftcontract.methods.processListing(data.id,data.to, data.cost);
            sendTransaction(tx, data.cost+800000, web3Service.key);//.send({from:web3Service.address, gas:6721975, value:data.cost+8000000});
        });

        nftcontract.events.OfferAccepted(()=>{return {};}).on('data', async (event:any)=>{
            console.log(event);
            const data = event.returnValues;
            const tx = nftcontract.methods.processOffer(data.id,data.to, data.cost)
            sendTransaction(tx, data.cost+800000, web3Service.key);//.send({from:web3Service.address, gas:6721975, value:data.cost+8000000});
        });
        return realasset;
    }

    public async minting(option: any)
    {
        const at = new AssetToken();
        at.index = option.tokenId;
        at.ownerid = option.creator;
        at.owneraddress = option.owneraddress;
        at.assetid = option.assetid;

        await assetRepository.createAssetTokens([at]);

        const ac = new Activity();
        ac.type = 0
        ac.to = option.owneraddress;
        ac.tokenindex = option.tokenId;
        ac.assetid = option.assetid;
        ac.timestamp = new Date(option.timestamp);
        await assetRepository.createActivity([ac]);
    }

    public async countAssets(): Promise<number>
    {
        return await assetRepository.countAssetData({});
    }

    public async getRandomAssetDatas(amount:number) : Promise<any[]>
    {
        const assets =  await assetRepository.getRandomAssetDatas(amount);
        const lists = []
        for(const at of assets)
        {
            lists.push({
                asset: at,
                token: await assetRepository.getRandomAssetToken(at.id)
            })
        }

        return lists;
    }

    public async getActivitiesFromAsset(assetid:number,limit = 20, offset=0, type:number = undefined) : Promise<Activity[]>
    {
        return await assetRepository.getActivitiesFromAsset(assetid,limit,offset, type);
    }

    public async createActivity(obj:any)
    {
        return await assetRepository.createActivity(obj);
    }

    public async getActivity(id:number)
    {
        return await assetRepository.getActivity(id);
    }

    public async getActivities(limit=20, offset=0, type:number=undefined)
    {
        return await assetRepository.getActivities(limit,offset,type);
    }

    public async getListActivities(assetid:number, offset:number)
    {
        return await assetRepository.findActivityData({assetid: assetid, type: 1, done:false}, undefined, offset);
    }

    public async getOfferActivities(assetid:number, offset:number)
    {
        return await assetRepository.findActivityData({assetid: assetid, type: 2, done:false}, undefined, offset);
    }

    public async createListActivity(assetid:number, tokenid:number, from:string, cost:number){
        const ac = new Activity();
        ac.assetid = assetid;
        ac.type = 1;
        ac.tokenindex = tokenid;
        ac.cost = cost;
        ac.from = from;

        await assetRepository.createActivity(ac);
    }

    public async acceptListActivity(activityid:number,to:string){
        const ac :Activity = await assetRepository.getActivity(activityid)
        //await solidityService.contracts["IPFSNFT"].sendMoneyTo(to, ac.from, ac.cost);
        const asset = await assetRepository.getAssetData(ac.assetid);
        //const contract = await solidityService.contracts["IPFSNFT"].getContract(asset.address);
        //await solidityService.contracts["IPFSNFT"].safeTransferFrom(contract, ac.from, to, ac.tokenindex);

        const assetoken = await assetRepository.getAssetToken(ac.assetid, ac.tokenindex);
        assetoken.owneraddress = to;

        const owner = await metamaskService.getMetamaskData(assetoken.owneraddress);
        if(owner) {
            assetoken.ownerid = owner.userid;
        }
        else
            assetoken.ownerid = null;
        await assetRepository.updateAssetToken(assetoken);

        ac.done = true;
        await assetRepository.updateActivityData(ac);

        ac.to = to;
        ac.type = 3;
        ac.timestamp = new Date();
        ac.id = undefined;
        await assetRepository.createActivity(ac);

        return "Success";
    }

    public async createOfferActivity(assetid:number, tokenid:number, to:string, cost:number){
        const ac = new Activity();
        ac.assetid = assetid;
        ac.type = 2;
        ac.tokenindex = tokenid;
        ac.cost = cost;
        ac.to = to;

        await assetRepository.createActivity(ac);
    }

    //Offer 제안 수락
    public async acceptOfferActivity(activityid:number, from:string, tokenidx:number){
        const ac :Activity = await assetRepository.getActivity(activityid) // Activity 정보 가져오기
        //await solidityService.contracts["IPFSNFT"].sendMoneyTo(ac.to, from, ac.cost); // 이더리움 네트워크에서 이더리움 전송

        const asset = await assetRepository.getAssetData(ac.assetid); // Asset 정보 가져오기
        //const contract = await solidityService.contracts["IPFSNFT"].getContract(asset.address); // Contract 객체 가져오기

        //await solidityService.contracts["IPFSNFT"].safeTransferFrom(contract, from, ac.to, tokenidx); // 이더리움 네트워크에서 토큰 전송

        const assetoken = await assetRepository.getAssetToken(ac.assetid, tokenidx); // 토큰 정보 가져오기
        assetoken.owneraddress = ac.to;

        const owner = await metamaskService.getMetamaskData(assetoken.owneraddress); // Address에 해당하는 메타마스크 정보 가져오기
        if(owner) {
            assetoken.ownerid = owner.userid;
        }
        else
            assetoken.ownerid = null;
        await assetRepository.updateAssetToken(assetoken); // 토큰의 정보 업데이트
        
        ac.done = true;
        await assetRepository.updateActivityData(ac); // Activity 업데이트

        ac.from = from;
        ac.type = 3;
        ac.timestamp = new Date();
        ac.id = undefined;
        ac.tokenindex = tokenidx;
        await assetRepository.createActivity(ac); // Sales Activity 생성

        return "Success";
    }

    public async getAssetToken(assetid:number, index:number): Promise<AssetToken>
    {
        return await assetRepository.getAssetToken(assetid, index);
    }

    public async getOwnedTokensByAsset(assetid:number, ownerid:number): Promise<AssetToken[]>
    {
        return await assetRepository.findAssetToken({
            assetid:assetid,
            ownerid:ownerid
        });
    }

    public async getLastestActivity(assetid:number, index:number): Promise<AssetToken>
    {
        return await assetRepository.getLatestActivity(assetid, index);
    }

    public async getProfileData(userid:number, obj:any)
    {
        const assets = await assetRepository.getCollectedAssets(userid);
        return assets;
    }

    public async createFavorite(userid:number, assetid:number)
    {
        return await assetRepository.createFavorite(userid, assetid);
    }

    public async getFavoritesByUserId(userid:number)
    {
        return await assetRepository.getFavoritesByUserId(userid);
    }
    
    public async findAssetData(obj:any)
    {
        return await assetRepository.findAssetData(obj);
    }
}

export const assetService = new AssetService(assetRepository);