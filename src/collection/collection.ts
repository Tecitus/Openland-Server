import {User} from "../user/user"

export class Collection {
    public id? : number;
    public logoimg? : string;
    public featuredimg? : string;
    public bannerimg? : string;
    public name? : string;
    public description? : string;
    public creator?: number | User;
}

export class Watch
{
    public id? : number;
    public userid? : number;
    public collectionid? : number;
}
