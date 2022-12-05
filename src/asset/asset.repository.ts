import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {runSql} from "../common/db/database";
import {db} from "../db/knex"
import {Asset, Activity} from "./asset"
import {AssetToken} from "./assettoken"
const LIMIT_MINUTE = 5;

export class AssetRepository {
    /*
    public async getAssetInfo(id: number): Promise<string> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, id);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }*/
    public async createAsset(asset:Asset): Promise<Asset>
    {
      try{
        const assetid = (await db.db('Assets').insert<Asset>(asset))[0];
        return await db.db('Assets').select('*').where({id:assetid}).first();
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }
  
    //DB 상의 id에 해당하는 에셋 데이터 반환
    public async getAssetData(assetid:number) : Promise<Asset>
    {
      try{
        const result = await db.db('Assets').select('*').first().where({id: assetid});
        return result;
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }
  
    //조건을 만족하는 에셋 데이터 반환
    public async findAssetData(obj:any) : Promise<Asset[]>
    {
      try{
        if(Object.keys(obj).length == 0)
        {
          const result = await db.db.select('*').from('Assets');
          return result;
        }
        const where : any = {};
        const wherein : any= {};
        for(const key in obj)
        {
            if(Array.isArray(obj[key]))
            {
                wherein[key] = obj[key];
            }
            else
            {
                where[key] = obj[key];
            }
        }

        let query = db.db.select('*').from('Assets');
        if("name" in where)
        {
            query = query.whereILike("name", `%${where["name"]}%`);
            delete where["name"];
        }
        query = query.where(where);
        for(const key in wherein)
        {
            query = query.whereIn(key, wherein[key]);
        }
        console.log(await query.toString())
        const result = await query;
        return result;
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }
  
  
    public async updateAssetData(asset:Asset) : Promise<boolean>
    {
      try{
        const result = await db.db('Assets').update(asset).where({id: asset.id});
        return true;
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }

    public async createAssetTokens(assettokens:AssetToken[]): Promise<boolean>
    {
      try{
        const assetid = (await db.db('AssetTokens').insert(assettokens));
        return true;
      }
      catch(err)
      {
        console.log(err)
        return false;
      }
    }

    public async updateAssetToken(assettoken:AssetToken) : Promise<boolean>
    {
      await db.db('AssetTokens').update(assettoken).where({assetid:assettoken.assetid, index: assettoken.index});
      return true;
    }

    public async countAssetData(obj:any) : Promise<number>
    {
      return Number((await db.db('Assets').count('id as CNT').where(obj).first()).CNT);
    }

    public async getRandomAssetDatas(amount:number) : Promise<Asset[]>
    {
      return await db.db("Assets").select('*').orderByRaw('RAND()').limit(amount);
    }

    public async getActivitiesFromAsset(assetid:number,limit=20,offset=1, type:number = undefined) : Promise<Activity[]>
    {
      let query = db.db("Activities").select('*');
      const whereobj : any = {assetid: assetid};
      if(type)
      {
        whereobj["type"] = type;
      }
      query = query.where(whereobj).orderBy('timestamp',"desc").limit(limit).offset(offset);

      return await query;
    }

    public async createActivity(activity:Activity | Activity[])
    {
      try{
        const assetid = (await db.db('Activities').insert(activity));
        return true;
      }
      catch(err)
      {
        console.log(err)
        return false;
      }
    }

    public async getAssetToken(assetid:number, tokenindex:number) : Promise<AssetToken>
    {
      return await db.db('AssetTokens').select('*').where({assetid: assetid, index: tokenindex}).first();
    }

    public async findAssetToken(obj:any) : Promise<AssetToken[]>
    {
      try{
        if(Object.keys(obj).length == 0)
        {
          const result = await db.db.select('*').from('AssetTokens');
          return result;
        }
        const where : any = {};
        const wherein : any= {};
        for(const key in obj)
        {
            if(Array.isArray(obj[key]))
            {
                wherein[key] = obj[key];
            }
            else
            {
                where[key] = obj[key];
            }
        }

        let query = db.db.select('*').from('AssetTokens').where(where);
        for(const key in wherein)
        {
            query = query.whereIn(key, wherein[key]);
        }
        const result = await query;
        return result;
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }

    public async getActivity(id:number)
    {
        return await db.db('Activities').select('*').where({id:id}).first();
    }

    public async getActivities(limit = 20, offset= 0, type:number= undefined)
    {
        let query = db.db('Activities').select('*').limit(limit).offset(limit*offset).orderBy('timestamp','desc');
        if(type)
          query = query.where({type:type});
        return await query;
    }

    public async updateActivityData(activity:Activity) : Promise<boolean>
    {
      try{
        const result = await db.db('Activities').update(activity).where({id: activity.id});
        return true;
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }

    public async getRandomAssetToken(assetid:number) : Promise<AssetToken>
    {
      return await db.db("AssetTokens").select('*').where({assetid: assetid}).orderByRaw('RAND()').first();
    }

    public async getLatestActivity(assetid:number, tokenindex:number) : Promise<Activity>
    {
      return await db.db("Activities").select('*').where({assetid:assetid, tokenindex:tokenindex}).orderBy("timestamp","desc").first();
    }

    public async findActivityData(obj:any, limit = 20, offset = 1) : Promise<Activity[]>
    {
      try{
        if(Object.keys(obj).length == 0)
        {
          const result = await db.db.select('*').from('Activities');
          return result;
        }
        const where : any = {};
        const wherein : any= {};
        for(const key in obj)
        {
            if(Array.isArray(obj[key]))
            {
                wherein[key] = obj[key];
            }
            else
            {
                where[key] = obj[key];
            }
        }

        let query = db.db.select('*').from('Activities').where(where);
        for(const key in wherein)
        {
            query = query.whereIn(key, wherein[key]);
        }
        const result = await query.orderBy("timestamp", "DESC").limit(limit).offset(offset);
        return result;
      }
      catch(err)
      {
        console.log(err)
        return null;
      }
    }

    public async getCollectedAssets(userid:number)
    {
      const result = await db.db("AssetTokens").select(["Assets.id", "AssetTokens.index"]).where({ownerid:userid}).leftJoin("Assets","AssetTokens.assetid","=","Assets.id").distinct("Assets.id");
      return result;
    }

    public async getFavoritesByUserId(userid:number)
    {
      const result = await db.db("Favorites").select('*').where({userid:userid});
      return result;
    }

    public async createFavorite(userid:number, assetid:number)
    {
      const result = await db.db("Favorites").insert({userid:userid, assetid:assetid});
      return true;
    }
}

export const assetRepository = new AssetRepository();