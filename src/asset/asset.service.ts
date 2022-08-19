import { AssetRepository, assetRepository } from "./asset.repository";
import { Asset } from "./asset";
import {AssetToken} from "./assettoken";
import { isThisMinute } from "date-fns";
import {User} from "../user/user";
import { ipfsService } from "../common/ipfs.service";
import {fileStorageService} from "../common/fileStorage.service";
import { solidityService } from "../solidity/SolidityService";
import {Contract} from "web3-eth-contract"
import { nft } from "../nft/nft";
export class AssetCreationOption
{
    constructor(
        public name: string,
        public symbol: string,
        public description: string,
        public creater: User | number, // 유저 또는 유저의 DB id
        public tokennumber : number, // 생성하려는 NFT 토큰 갯수
        public image : Buffer // 파일의 버퍼
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
        public creater?: User | number, // 유저 또는 유저의 DB id
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
    public async getAssetInfo(id: number): Promise<string> {
        try {
            return await this.AssetRepository.getAssetInfo(id);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }   

    //주어진 옵션을 만족하는 에셋들을 반환
    public async searchAssets(option:AssetSearchOption): Promise<Asset[]>
    {
        try {
            return await this.AssetRepository.searchAssets(option);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    //target의 소유권을 to에게 이동, 성공시 true 반환, 아니면 false
    public async transferOwnership(target:AssetToken, to:number): Promise<boolean>
    {
        return null;
    }

    // 새 에셋 생성
    // 업로드 받은 파일을 IPFS에 업로드 하고 IPFS URI를 받아옴
    // 받아온 URI와 주어진 데이터를 통해 NFT를 생성
    // 생성된 NFT 정보를 DB에 저장
    public async createNewAsset(option: AssetCreationOption): Promise<Asset>
    {
        const cid = await ipfsService.uploadFile(option.image); //ipfs에 파일 업로드
        let nftcontract : Contract = await solidityService.contracts["IPFSNFT"].makeNewContractAsync([option.name,option.symbol,cid,option.tokennumber]); //컨트랙트 생성
        let asset = new Asset();
        asset.name = option.name;
        asset.symbol = option.symbol;
        asset.description = option.description;
        asset.totaltokens = option.tokennumber;
        asset.creator = option.creater;
        asset.ipfshash = cid;
        asset.address = nftcontract.options.address; // 컨트랙트 주소
        asset.assetTokens = new Array<AssetToken>(option.tokennumber);

        for(let i = 0; i < option.tokennumber ; i++)
        {
            let at = asset.assetTokens[i] = new AssetToken();
            at.index = i;
            at.ownerid = asset.creator;
            at.owneraddress = null; // TODO
        }

        return null;
    }
}

export const assetService = new AssetService(assetRepository);