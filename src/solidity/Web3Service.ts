import Web3 from "web3";
import { appConfig } from "../app-config";
export const web3 = new Web3(new Web3.providers.HttpProvider(appConfig.getConfig.web3.url))

class Web3Service
{
    private _address : string;
    public key:string;

    public get address():string { return this._address; }
    public set address(value:string)
    {
        this._address = value;
        web3.eth.defaultAccount = value;
    }

    constructor(private __address:string = appConfig.getConfig.web3.address, private _key:string = appConfig.getConfig.web3.privatekey)
    {
        this.address = __address;
        this.key = _key;
    }
}

export const web3Service = new Web3Service();