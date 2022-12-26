//TODO : collection ranking
//TODO : collection
import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {db} from "../db/knex"
import { Collection, Watch } from './collection';

const LIMIT_MINUTE = 5;

export class CollectionRepository {
    public async getCollectionData(collectionid:number): Promise<Collection>
    {
        try
        {
            return await db.db("Collections").select('*').first().where({id: collectionid});
        }
        catch(err)
        {
            return null;
        }
    }

    public async createCollection(collection:Collection): Promise<number[]>
    {
        try
        {
            return await db.db("Collections").insert(collection);
        }
        catch(err)
        {
            console.log(err);
            return null;
        }
    }

    public async findCollectionData(obj:any) : Promise<Collection[]>
    {
      try{
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

        let query = db.db.select('*').from('Collections');
        if("name" in where)
        {
            query = query.whereILike("name",`%${where["name"]}%`)
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
        return null;
      }
    }

    public async updateCollectionData(collection:Collection) : Promise<boolean>
    {
      try{
        const result = await db.db('Collections').update(collection).where({id:collection.id});
        return true;
      }
      catch(err)
      {
        return null;
      }
    }

    public async getCollectionsCount() : Promise<number>
    {
        try{
            const result = Number(await db.db('Collections').count());
            return result;
          }
          catch(err)
          {
            return null;
          }
    }

    public async getWatchData(userid:number) : Promise<Watch[]>
    {
        return await db.db("Watches").select('*').where({userid: userid});
    }

    public async createWatchData(userid:number, collectionid:number) : Promise<Watch>
    {
        return await db.db("Watches").insert({userid: userid, collectionid: collectionid});
    }

    public async countAssets(collectionid:number)
    {
        return Number((await db.db('Assets').count('id as CNT').where({collectionid: collectionid}).first()).CNT);
    }

    public async countVolumes(collectionid:number)
    {
        return Number((await db.db.from("Collections").select('*').innerJoin("Assets","Assets.collectionid","Collections.id").innerJoin("Activities","Activities.assetid", "Assets.id").where("Activities.type",3).where("Collections.id", collectionid).count('Activities.id as CNT').first()).CNT);
    }

    public async countOwners(collectionid:number)
    {
        //return Number((await db.db.from("Collections").select('*').innerJoin("Assets","Assets.collectionid","Collections.id").innerJoin("AssetTokens","AssetTokens.assetid", "Assets.id").innerJoin("Users","Users.id", "AssetTokens.ownerid").where("Collections.id", collectionid).distinct("Users.id").count('Users.id as CNT').first()).CNT);
        const result = await db.db.raw("SELECT COUNT(DISTINCT Users.id) FROM Collections JOIN Assets ON Assets.collectionid = Collections.id JOIN AssetTokens ON AssetTokens.assetid = Assets.id JOIN Users ON Users.id = AssetTokens.ownerid WHERE Collections.id = "+collectionid)
        return result[0][0]["COUNT(DISTINCT Users.id)"];
    }

    public async getRandomCollections(amount:number, offset = 0) : Promise<Collection[]>
    {
      return await db.db("Collections").select('*').orderByRaw('RAND()').limit(amount).offset(amount*offset);
    }

    public async getAssetsByCollectionId(collectionid:number)
    {
        return await db.db("Assets").select('*').where({collectionid:collectionid});
    }

    public async getActivitiesByCollection(collectionid:number, offset=0)
    {
        //return await db.db.from("Activities").select('*').innerJoin('Assets',"Assets.id","Activities.assetid").innerJoin("Collections", "Collections.id", "Assets.collectionid")//.where("Collection.id", collectionid).orderBy("Activities.timestamp","desc").limit(20).offset(offset * 20);
        return await db.db.from("Collections").where("Collections.id", collectionid).select('*').innerJoin("Assets","Assets.collectionid","Collections.id").innerJoin("Activities","Activities.assetid", "Assets.id");
    }
}

