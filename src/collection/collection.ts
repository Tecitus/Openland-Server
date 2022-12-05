import {User} from "../user/user"

export class Collection {

    /*
    private _address: string
    private _profileImg: string
    private _name: string
    private _relayedId: string
    private _id: string
    private _description: string
    private _symbol: number
    private _itemCnt: number
    private _ownerCnt: number
    private _totalVol: number
    private _floorPrice: number
    private _bestOffer: number
    private _totalSupply: number
    private _twitter: string
    private _discord: string
    */
    // collection 기본 정보들
    // twitter과 discord는 어케 주는지 잘 모르겟삼 - 이미 1차 랜더링 된걸 서버에서 주는건가
    // TODO : 체인 상에서 id = relayedId, 디비 상에서 Id = id 같은데 체크해봐야함

    public id? : number;
    public logoimg? : string;
    public featuredimg? : string;
    public bannerimg? : string;
    public name? : string;
    public description? : string;
    //public symbol?: string;
    public creator?: number | User;
}

export class Watch
{
    public id? : number;
    public userid? : number;
    public collectionid? : number;
}
