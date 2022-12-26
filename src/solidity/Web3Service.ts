import Web3 from "web3";
import { appConfig } from "../app-config";
export const web3 = new Web3(new Web3.providers.WebsocketProvider(appConfig.getConfig.web3.url))

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

        //web3.eth.personal.unlockAccount(this._address, this.key, 0);
    }
    
}

export const web3Service = new Web3Service();

export async function signAndSendTransaction(to:string, data:any, value:any,privatekey:string, gas = appConfig.getConfig.web3.gaslimit,txcount:number= undefined) {
    const options:any = {
        data : data,
        value: value,
        gas  : gas ? gas : (await web3.eth.getBlock("latest")).gasLimit,
    };
    if(to)
        options.to = to;
    if(txcount)
        options.nonce = txcount;
    const signedTransaction  = await web3.eth.accounts.signTransaction(options, privatekey);
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return transactionReceipt;
}

export async function sendTransaction(transaction:any, value = 30000000,key:string) {
    let to = undefined;
    if(transaction)
        to = transaction._parent._address;
    return await signAndSendTransaction(to, transaction.encodeABI(), value,key);
}