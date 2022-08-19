import {AssetToken} from "./assettoken";
import {User} from "../user/user";
export class Asset {
    public name:string;
    public symbol:string;
    public description:string;
    public totaltokens: Number;
    public creator: User | Number;
    public ipfshash: string;
    public assetTokens: AssetToken[];
    public address:string; // 에셋의 컨트랙트 주소
}