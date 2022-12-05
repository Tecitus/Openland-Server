import {AssetToken} from "./assettoken";
import {User} from "../user/user";
export class Asset {
    public id?:number;
    public name?:string;
    public symbol?:string;
    public description?:string;
    public totaltokens?: number;
    public creator?: number;
    public ipfshash?: string;
    public assetTokens?: AssetToken[];
    public address?:string; // 에셋의 컨트랙트 주소
    public collectionid?:number;
}

export class Activity
{
    public id?:number;
    public type?:number;
    public tokenindex?:number;
    public assetid?:number;
    public from?:string;
    public to?:string;
    public cost?:number;
    public timestamp?:Date;
    public due?:Date;
    public done?:boolean;
}