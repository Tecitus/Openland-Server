import { AssetService, assetService } from "./asset.service";
import { AssetCreationOption, AssetSearchOption } from "./asset.service";
import { fileStorageService } from "../common/filestorage.service";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";
import {Request, Response,Express} from "express";
import { metamaskService } from "../metamask/metamask.service";
export class AssetController
{
    constructor(private AssetService : AssetService)
    {
        
    }

    // 주어진 id로 DB에 저장된 에셋 정보 반환
    public getAssetData()
    {
        return async (req: Request, res: Response) =>
        {
            try
            {
                const result = await this.AssetService.getAssetData(Number(req.params.id))
                //json(res, resultAppend(result, true));
                res.send(result);
            }
            catch (err)
            {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    // 새 에셋 생성
    // 업로드 받은 파일을 IPFS에 업로드 하고 IPFS URI를 받아옴
    // 받아온 URI와 주어진 데이터를 통해 NFT를 생성
    // 생성된 NFT 정보를 DB에 저장
    public createNewAsset()
    {
        return async (req: Request, res: Response) =>
        {
            try
            {
                const file = req.file;
                const filepath = req.file.filename;
                const filebuffer = fileStorageService.readFile(req.file.filename);

                //@ts-ignore
                const aco = new AssetCreationOption(req.body.name, 
                    req.body.symbol, 
                    req.body.description, //@ts-ignore
                    req.session.user.id, 
                    Number(req.body.supply), 
                    filebuffer,
                    Number(req.body.collectionid),
                    req.body.creatoraddress
                    )
                const asset = await assetService.createNewAsset(aco,null);
                res.send("Success");
            }
            catch(err)
            {
                console.log(err);
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public createAsset()
    {
        return async (req: Request, res: Response) =>
        {
            try
            {
                const contractaddress = req.body.contractaddress;
                const hash = req.body.hash;
                const name = req.body.name;
                const description = req.body.description;
                const supply = Number(req.body.supply);
                const collectionid = Number(req.body.collectionid);
                const creatoraddress = req.body.creatoraddress;
                const symbol = req.body.symbol;
                //@ts-ignore
                const creator = req.session.user.id;
                console.log(req.body);
                const asset = await assetService.createAsset({
                    name: name,
                    symbol: symbol,
                    description: description,
                    tokennumber: supply,
                    collectionid: collectionid,
                    creatoraddress: creatoraddress,
                    hash: hash,
                    address: contractaddress,
                    creator: creator
                });
                res.send("Success");
            }
            catch(err)
            {
                console.log(err);
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }
    
    public getRandomAssetDatas()
    {
        return async (req: Request,res:Response)=>{
            const amount = Number(req.params.amount)
            res.send(await assetService.getRandomAssetDatas(amount));
        }
    }

    public getActivitiesFromAsset()
    {
        return async (req: Request,res:Response)=>{
            const assetid = Number(req.query.assetid);
            const limit = Number(req.query.limit)
            const offset = Number(req.query.offset);
            const type = Number(req.query.type);
            res.send(await assetService.getActivitiesFromAsset(assetid, limit, offset, type));
        }
    }

    public createActivity()
    {
        return async (req: Request,res:Response)=>{
            const assetid = Number(req.query.assetid);
            const type = Number(req.query.type);
            const tokenindex = Number(req.query.tokenindex);
            const from = req.query.from;
            const to = req.query.to;
            const cost = Number(req.query.cost);
            const duration = Number(req.query.duration);
            const obj :any = {}
            obj.assetid = assetid;
            obj.type = type;
            obj.tokenindex = tokenindex;
            from ? obj.from = from : undefined;
            to ? obj.to = to : undefined;
            cost ? obj.cost = cost : undefined;
            duration ? obj.duration = duration : undefined;
            res.send(await assetService.createActivity(obj));
        }
    }

    public createList()
    {
        return async (req: Request,res:Response)=>{
            const assetid = Number(req.body.assetid);
            const type = 1;
            const tokenindexes = req.body.tokenindexes;
            const from = req.body.from;
            const cost = Number(req.body.cost);
            const obj :any = {}
            obj.assetid = assetid;
            obj.type = type;
            //obj.tokenindex = tokenindex;
            //@ts-ignore
            obj.from = from ? from : (await metamaskService.getMetamaskDataWithUserId(req.session.user.id))[0].address
            obj.cost = cost;
            console.log(tokenindexes)
            //@ts-ignore
            for(const tokenindex of tokenindexes)
            {
                obj.tokenindex = Number(tokenindex);
                console.log(obj);
                await assetService.createActivity(obj)
            }
            res.send("Success");
        }
    }

    public createOffer()
    {
        return async (req: Request,res:Response)=>{
            const assetid = Number(req.body.assetid);
            const type = 2;
            const to = req.body.to;
            const cost = Number(req.body.cost);
            const amount = Number(req.body.amount);
            const obj :any = {}
            obj.assetid = assetid;
            obj.type = type;
            //obj.tokenindex = tokenindex;
            //@ts-ignore
            obj.to = to ? to : (await metamaskService.getMetamaskDataWithUserId(req.session.user.id))[0].address
            obj.cost = cost;
            for(let i = 0; i < amount ; i ++)
            {
                await assetService.createActivity(obj);
            }
            res.send("Success");
        }
    }

    public acceptListing()
    {
        return async (req: Request, res:Response)=>
        {
            const activityid = Number(req.body.activityid);
            //@ts-ignore
            const address = req.body.address ? req.body.address : (await metamaskService.getMetamaskDataWithUserId(req.session.user.id))[0].address;
            const activity = await assetService.getActivity(activityid);
            console.log(activity);
            await assetService.acceptListActivity(activity.id, address);
            res.send("Success");
        }
    }

    public getListActivities()
    {
        return async (req: Request, res:Response)=>
        {
            const assetid = Number(req.query.assetid);
            const offset = Number(req.query.offset as string);

            res.send(await assetService.getListActivities(assetid, offset));
        }
    }

    public getOfferActivities()
    {
        return async (req: Request, res:Response)=>
        {
            const assetid = Number(req.query.assetid);
            const offset = Number(req.query.offset as string);

            res.send(await assetService.getOfferActivities(assetid, offset));
        }
    }

    public acceptOffer()
    {
        return async (req:Request, res:Response) =>
        {
            const activityid = Number(req.body.activityid);
            //@ts-ignore
            const address = req.body.address ? req.body.address : (await metamaskService.getMetamaskDataWithUserId(req.session.user.id))[0].address;
            const tokenidx = Number(req.body.tokenidx);
            const activity = await assetService.getActivity(activityid);
            
            await assetService.acceptOfferActivity(activity.id, address, tokenidx);
            res.send("Success");
        }
    }

    public getActivities()
    {
        return async (req:Request, res:Response) =>
        {
            const offset = Number(req.query.offset);
            const type = Number(req.query.type);
            res.send(await assetService.getActivities(undefined, offset, type));
        }
    }

    public getAssetToken()
    {
        return async (req:Request, res:Response) =>
        {
            const assetid = Number(req.params.assetid);
            const index =Number(req.params.index);
            res.send(await assetService.getAssetToken(assetid, index));
        }
    }

    public getOwnedTokensByAsset()
    {
        return async (req:Request, res:Response) =>
        {
            const assetid = Number(req.params.assetid);
            //@ts-ignore
            const userid = req.session.user.id;
            res.send(await assetService.getOwnedTokensByAsset(assetid, userid));
        }
    }

    public getLatestActivity()
    {
        return async (req:Request, res:Response) =>
        {
            const assetid = Number(req.params.assetid);
            const index =Number(req.params.index);
            res.send(await assetService.getLastestActivity(assetid, index));
        }
    }

    
    public transferNFT()
    {
        return async (req:Request, res:Response) =>
        {
            const assetid = Number(req.body.assetid);
            const type = 1;
            const tokenindexes = req.body.tokenindexes;
            const from = req.body.from;
            const to = req.body.to;
            for(const t of tokenindexes)
            {
                const token = await assetService.getAssetToken(assetid, t);
                await assetService.transferOwnership(token, to);
            }
            res.send("Success");
        }
    }

    public getProfileAssetData()
    {
        return async (req:Request, res:Response) =>
        {
            //@ts-ignore
            const userid = req.query.userid ? req.query.userid : req.session.user.id;
            if(userid == undefined || userid == null || userid == 'undefined' || userid == 'NaN')
                return;
            res.send(await assetService.getProfileData(userid,null));
        }
    }

    public createFavorite()
    {
        return async (req:Request, res:Response) =>
        {
            //@ts-ignore
            const userid = req.session.user.id;
            const assetid = Number(req.params.assetid);
            await assetService.createFavorite(userid,assetid)
            res.send("Success");
        }
    }

    public getFavoritesByUserId()
    {
        return async (req:Request, res:Response) =>
        {
            //@ts-ignore
            const userid = req.query.userid ? req.query.userid : req.session.user.id;
            res.send(await assetService.getFavoritesByUserId(userid));
        }
    }
    
    public searchAssets()
    {
        return async (req:Request, res:Response) =>
        {
            const query = req.query.query;
            res.send(await assetService.searchAssets({name:{query}}));
        }
    }

    public findAssets()
    {
        return async (req: Request, res: Response) =>
        {
            res.send(await assetService.findAssetData(req.query));
        }
    }
}

export const assetController = new AssetController(assetService);