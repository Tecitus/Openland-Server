type ProviderType = 'metamask' | 'kaikas'

export class Metamask {

    private _address: string;
    private _wallet: number; //보유한 코인?
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

    get wallet(): number {
        return this._wallet;
    }

    set wallet(value: number) {
        this._wallet = value;
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
