import Web3 from "web3";
export const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

class Web3Service
{
    private _address : string;
    public key:string;

    public get address():string { return this._address; }
    public set address(value:string)
    {
        this._address = value;
        web3.defaultAccount = value;
    }

    constructor(private __address:string = undefined, private _key:string = undefined)
    {
        this.address = __address;
        this.key = _key;
    }
}

export const web3Service = new Web3Service();