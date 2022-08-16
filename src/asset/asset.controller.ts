import { AssetService, assetService } from "./asset.service";
import { AssetCreationOption } from "./asset.service";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";
import {Request, Response,Express} from "express";
export class AssetController
{
    constructor(private AssetService : AssetService)
    {
        
    }

    // 주어진 id로 DB에 저장된 에셋 정보 반환
    public getAssetInfo()
    {
        return async (req: Request, res: Response) =>
        {
            try
            {
                let result = this.AssetService.getAssetInfo(Number(req.params.id))
                return json(res, resultAppend(result, true));
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
                const filepath = req.file.path;
                const filebuffer = req.file.buffer;
                const aco = new AssetCreationOption(req.params.name, req.params.symbol, req.params.description, undefined, Number(req.params.tokennumber), filebuffer)
                return;
            }
            catch(err)
            {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }
}

export const assetController = new AssetController(assetService);