import {create, IPFSHTTPClient} from 'ipfs-http-client'

export class IPFSService
{
    public ipfsClient : IPFSHTTPClient
    constructor(ipfsserverurl:string = "", private ipfsGatewayURL:string = "")
    {
        this.ipfsClient = create({url: ipfsserverurl});
    }

    //주어진 파일을 IPFS에 업로드
    public async uploadFile(file:Buffer)
    {
        let {cid} = await this.ipfsClient.add(file);
        return cid.toString();
    }

    //주어진 ipfs 해시에 해당하는 파일(버퍼) 받기
    public async getFileFromHash(hash:string)
    {
        const asynciter = this.ipfsClient.cat(this.ipfsGatewayURL + hash);
        let merged : Uint8Array = new Uint8Array(0);
        for await (const chunk of asynciter)
        {
            let newarray = new Uint8Array(merged.length + chunk.length);
            newarray.set(merged);
            newarray.set(chunk, merged.length);
            merged = newarray;
        }
        return Buffer.from(merged);
    }
}

export const ipfsService = new IPFSService();