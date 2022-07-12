//TODO : collection ranking
//TODO : collection
import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {collectionService, CollectionService} from './Collection.Service';
import {Request, Response} from "express";
import {json} from "../common/controller";
import {necessary, resultAppend} from "../common/util";
import {userService} from "../user/user.service";
import {PoolConnection} from "mysql2";
import {threadId} from "worker_threads";


class CollectionController {
    constructor(private collectionService: CollectionService) {
    }

    public async getCollectionInfo() {
        return async (req: Request, res: Response) => {
            try {
                const name: string = req.body.variables.collection;
                const reqQueryId: string = req.body.id;
                //useIsEditableQuery 이면 isEditable 판단 후 반환

                const collectionId: string = await this.collectionService.getCollectionId(name);
                let result = new Object({"collection": {"id": collectionId}});

                if (reqQueryId == 'useIsEditableQuery') {
                    const userId = res.locals.user.id;
                    const isEditable: boolean = await this.collectionService.checkUsrEditAuth(userId, collectionId);
                    Object.assign(result, {"isEditable": isEditable})
                }

                return json(res, resultAppend(result, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public async createCollection() {
        return async (req: Request, res: Response) => {
            const conn: PoolConnection = await startTraction();
            try {
                const user: User = res.locals.user;
                const data: string = req.body;
                const threadId = Number(req.params.id);
                await necessary(String(threadId));
                const val = req.body;
                await this.colletionService.postCreate(user, threadId, val, conn);
                const list = await this.collectionService.getDetailById(threadId);
                await commitConn(conn);
                const arranged = Object.assign({}, {thread: list});
                const result = resultAppend(arranged, true);
                json(res, result);
            } catch (err) {
                await conn.rollback();
                conn.release();
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }


    }

    export
    const
    collection = new CollectionController(collectionService)
