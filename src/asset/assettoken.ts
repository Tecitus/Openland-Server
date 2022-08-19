import {User} from "../user/user";

export class AssetToken
{
    public owneraddress: string; // 토큰을 소유한 지갑 주소
    public ownerid: User | Number; 
    public index: Number;
}