type ProviderType = 'metamask' | 'kaikas'

export class Metamask {

    private _address: string;
    //private _wallet:string;//보유한 코인?
    private _balance: number;
    private _id: string;
    private _nonce: number;
    //address 가 어디건지 백엔드 단에서 확인한번더 하던가..? 가 아니라 애초에 백엔드에서 해야할emt
    //
    get address(): string {
        return this._address;
    }

    set address(value: string) {
        this._address = value;
    }

    get balnace(): number {
        return this._balance;
    }

    set balnace(value: number) {
        this._balance = value;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get nonce(): number{
        return this._nonce;
    }

    set nonce(value: number){
        this._nonce = value;
    }
}
