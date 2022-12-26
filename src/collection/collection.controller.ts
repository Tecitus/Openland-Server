//TODO : collection ranking
//TODO : collection
import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {collectionService, CollectionService} from './collection.service';
import {Request, Response} from "express";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";
import {userService} from "../user/user.service";
import {PoolConnection} from "mysql2";
import {threadId} from "worker_threads";


class CollectionController {
    constructor(private collectionService: CollectionService) {
    }

    public getCollectionInfo() {
        return async (req: Request, res: Response) => {
            try {
                const collectionid = Number(req.params.id);
                res.send(await this.collectionService.getCollectionInfo(collectionid));
                return;
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public getMyCollectionLists()
    {
        return async (req: Request, res: Response) => {
            try {
                //@ts-ignore
                const userid = req.session.user.id;
                res.send(await this.collectionService.findCollectionData({creator: userid}));
                return;
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public getRandomCollections()
    {
        return async (req: Request, res: Response) => {
            try {
                //@ts-ignore
                const amount = Number(req.params.amount);
                const offset = Number(req.query.offset)
                res.send(await this.collectionService.getRandomCollections(amount, offset));
                return;
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public createCollection() {
        return async (req: Request, res: Response) => {
            try {
                //@ts-ignore
                if(req.session.user == undefined) {
                    res.send("Should be signed in.");
                    return;
                }
                const name = req.body.name;
                const description = req.body.description;
                //const symbol = req.body.symbol;
                //@ts-ignore
                const creatorid = req.session.user.id;
                //@ts-ignore
                const bannerImg = req.files.bannerimage[0].filename;
                //@ts-ignore
                const logoImg = req.files.logoimage[0].filename;
                //@ts-ignore
                const featuredImg = req.files.featuredimage[0].filename;

                await this.collectionService.createCollection({
                    name: name,
                    description: description,
                    //symbol: symbol,
                    creator: creatorid,
                    bannerimg: bannerImg,
                    featuredimg: featuredImg,
                    logoimg : logoImg,
                });

                res.send("Success");
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }


    }

    public addWatch()
    {
        return async (req: Request, res: Response)=> {
            //@ts-ignore
            if(req.session.user == undefined) {
                res.send("Should be signed in.");
                return;
            }

            const collectionid = Number(req.params.collectionid);
            //@ts-ignore
            await collectionService.createWatchData(req.session.user.id, collectionid);

            res.send("Success");
        }
    }

    public getWatches()
    {
        return async (req: Request, res: Response)=> {
            //@ts-ignore
            if(req.session.user == undefined) {
                res.send("Should be signed in.");
                return;
            }
            //@ts-ignore
            res.send(await collectionService.getWatchData(req.session.user.id));
        }
    }

    public countAssets()
    {
        return async (req: Request, res: Response)=> {
            const collectionid = Number(req.params.collectionid);
            res.send(await collectionService.countAssets(collectionid));
        }
    }

    public getAdditionalInfo()
    {
        return async (req: Request, res: Response)=> {
            const collectionid = Number(req.params.collectionid);
            const assets = await collectionService.countAssets(collectionid);
            const owners = await collectionService.countOwners(collectionid);
            const volumes = await collectionService.countVolumes(collectionid);
            res.send({assets, owners, volumes});
        }
    }

    public getAssetsByCollectionId()
    {
        return async (req: Request, res:Response) =>
        {
            const collectionid = Number(req.params.collectionid)
            res.send(await collectionService.getAssetsByCollectionId(collectionid));
        }
    }

    public findCollections()
    {
        return async (req: Request, res: Response) =>
        {
            res.send(await collectionService.findCollectionData(req.query));
        }
    }
    public getActivitiesByCollection()
    {
        return async (req: Request, res: Response) =>
        {
            const collectionid = Number(req.query.collectionid);
            const offset = Number(req.query.offset)
            res.send(await collectionService.getActivitiesByCollection(collectionid, offset));
        }
    }
}

export const collectionController = new CollectionController(collectionService);