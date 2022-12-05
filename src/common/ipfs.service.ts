//@ts-ignore
import {create, IPFSHTTPClient} from 'ipfs-http-client'
import { appConfig } from "../app-config";
export class IPFSService
{
    public ipfsClient : IPFSHTTPClient
    constructor(ipfsserverurl:string, private ipfsGatewayURL:string = "https://ipfs.io/ipfs/")
    {
        const auth = 'Basic ' + Buffer.from(appConfig.getConfig.ipfs.projectid + ':' + appConfig.getConfig.ipfs.projectsecret).toString('base64');
        this.ipfsClient = create({    
            //host: 'ipfs.infura.io',
            //port: 5001,
            //protocol: 'https',
            url:ipfsserverurl,
            headers: {
                authorization: auth,
        },});
    }

    //주어진 파일을 IPFS에 업로드
    public async uploadFile(file:Buffer)
    {
        const {cid} = await this.ipfsClient.add(file);
        return cid.toString();
    }

    //주어진 ipfs 해시에 해당하는 파일(버퍼) 받기
    public async getFileFromHash(hash:string)
    {
        if(hash == undefined || hash == "" || hash == "undefined")
            return null;
        const asynciter = this.ipfsClient.cat(hash);//this.ipfsGatewayURL + hash);
        let merged : Uint8Array = new Uint8Array(0);
        for await (const chunk of asynciter)
        {
            const newarray = new Uint8Array(merged.length + chunk.length);
            newarray.set(merged);
            newarray.set(chunk, merged.length);
            merged = newarray;
        }
        return Buffer.from(merged);
    }
}

export const ipfsService = new IPFSService(appConfig.getConfig.ipfs.endpoint);