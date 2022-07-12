//TODO : {collection} -> {main name}
import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {collectionService, CollectionService} from './Collection.Service';
import {Request, Response} from "express";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";


class CollectionController {
    constructor(private CollectionService: CollectionService
    ) {
    }

    public async getCollectionInfo() {
        return async (req: Request, res: Response) => {
            try {

                return json(res, resultAppend({userId: id}, true));
            } catch
                (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }


}

export const collection = new CollectionController(collectionService)
