//TODO : collection ranking
//TODO : collection
import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {Collection, Watch} from './collection';
import {CollectionRepository} from './collection.repository';
import {Request, Response} from "express";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";

const LIMIT_MINUTE = 5;

export class CollectionService {
    constructor(private collectionRepository: CollectionRepository,) {
    }

    /*
    public async getCollectionId(name: string): Promise<string> {
        try {
            return await this.collectionRepository.getCollectionId(name);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async getCollectionInfo(id: Number): Promise<string> {
        try {
            return await this.collectionRepository.getCollectionInfo(id);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async checkUsrEditAuth(userId: string, collectionId: string): Promise<boolean> {
        try {
            return await this.collectionRepository.checkUsrEditAuth(userId, collectionId);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async changeCollectionInfo(name: string, data: any): Promise<boolean> {
        try {
            return await this.collectionRepository.checkUsrEditAuth(userId, collectionId);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }*/

    public async getCollectionInfo(id:number): Promise<Collection> {
        try {
            return await this.collectionRepository.getCollectionData(id);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async createCollection(obj:any): Promise<Collection> {
        try {
            const result = await this.collectionRepository.createCollection(obj as Collection);
            return await this.collectionRepository.getCollectionData(result[0]);
        } catch (err) {
            console.log(err);
            return await Promise.reject(err.message);
        }
    }

    public async findCollectionData(obj:any): Promise<Collection[]>
    {
        try {
            return await this.collectionRepository.findCollectionData(obj);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async getWatchData(userid:number) : Promise<Watch[]>
    {
        return await this.collectionRepository.getWatchData(userid);
    }

    public async createWatchData(userid:number, collectionid:number) : Promise<Watch>
    {
        return await this.collectionRepository.createWatchData(userid, collectionid);
    }

    public async countAssets(collectionid:number) : Promise<number>
    {
        return await this.collectionRepository.countAssets(collectionid);
    }

    public async countVolumes(collectionid:number) : Promise<number>
    {
        return await this.collectionRepository.countVolumes(collectionid);
    }

    public async countOwners(collectionid:number) : Promise<number>
    {
        return await this.collectionRepository.countOwners(collectionid);
    }

    public async getRandomCollections(amount:number, offset:number) : Promise<Collection[]>
    {
        return await this.collectionRepository.getRandomCollections(amount, offset);
    }

    public async getAssetsByCollectionId(collectionid:number)
    {
        return await this.collectionRepository.getAssetsByCollectionId(collectionid);
    }

    public async getActivitiesByCollection(collectionid:number, offset=0)
    {
        return await this.collectionRepository.getActivitiesByCollection(collectionid, offset);
    }
}

export const collectionService = new CollectionService(new CollectionRepository())
