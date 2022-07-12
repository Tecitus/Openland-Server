//TODO : collection ranking
//TODO : collection
import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {CollectionRepository} from './collection.repository';
import {Request, Response} from "express";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";

const LIMIT_MINUTE = 5;

export class CollectionService {
    constructor(private collectionRepository: CollectionRepository,) {
    }

    public async getCollectionId(name: string): Promise<string> {
        try {
            return await this.collectionRepository.getCollectionId(name);
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
    }

}

export const collectionService = new CollectionService(new CollectionRepository())
