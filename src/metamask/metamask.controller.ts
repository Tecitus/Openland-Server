import {NextFunction, Request, RequestHandler, Response} from 'express';
import {isPresent, necessary, resultAppend} from '../common/util';
import {email} from '../common/email/email';
import {metamaskService, MetamaskService} from './metamask.service';
import {commonService} from '../common/common.service';
import * as querystring from 'querystring';
import {appConfig} from '../app-config';
import {Metamask} from "./metamask";
import {json} from "../common/controller";
import {web3} from "../solidity/Web3Service";
import { userService } from '../user/user.service';
import { User } from '../user/user';
import {toBuffer, hashPersonalMessage, fromRpcSig, ecrecover, publicToAddress, bufferToHex, fromUtf8,intToHex} from 'ethereumjs-util';
//https://blog.devgenius.io/authenticating-users-to-your-web-app-using-metamask-and-nodejs-e920e45e358 참조
export class MetamaskController {
    constructor(
        private metamaskService: MetamaskService
    ) {
    }

    public nonces:{[address:string]: number} = {};
    public registerCandidates : {[address: string]: Date} = {}

// 1. 메타마스크 connect 확인 2. 연결 후 메타마스크 address 아카이빙
// join에서 metamask error 뜰 필요가 없음 걍 연결해주면 됨
    public joinOrLogin() {
        return async (req: Request, res: Response) => {
            try {
                const publicaddress = req.body.address;
                const signature = req.body.signature;
                const nonce = this.nonces[publicaddress];
                console.log(nonce, signature);

                if(nonce == undefined){
                    json(res, resultAppend({}, false, "Nonce does not exist"), 400);
                    return;
                }
                console.log(intToHex(nonce));
                const msgBuffer = toBuffer(intToHex(nonce));
                const msgHash = hashPersonalMessage(msgBuffer);
                
                //const signatureBuffer = ethUtil.toBuffer(signature);
                const signatureParams = fromRpcSig(signature);
                
                /*
                const sgn = signature.slice(2);
                const r = Buffer.from(sgn.slice(0, 64), "hex");
                const s = Buffer.from(sgn.slice(64, 128), "hex");
                const v = parseInt(sgn.slice(128), 16);
                */
                const publicKey = ecrecover(
                    msgHash,
                    signatureParams.v,
                    signatureParams.r,
                    signatureParams.s
                    //v,r,s
                  );
                const addressBuffer = publicToAddress(publicKey);
                const address = bufferToHex(addressBuffer);
                //const decryptedaddress = await web3.eth.personal.ecRecover(nonce, signature);

                delete this.nonces[address];
                
                console.log(address, publicaddress);
                if(address.toLowerCase() != publicaddress.toLowerCase())
                {
                    json(res, resultAppend({}, false, "Wrong signature or address"), 400);
                    return;
                }

                const metamask = await this.metamaskService.getMetamaskData(address);

                if(metamask == null || metamask == undefined)
                {
                    // 회원가입 창 띄우기
                    res.send("Do Register:" + address);
                    return;
                }

                //@ts-ignore
                req.session.user = await userService.getUserData(metamask.userid);
                //@ts-ignore
                req.session.metamasks = await this.metamaskService.getMetamaskDataWithUserId(metamask.userid);

                await req.session.save();
                res.send({userId: metamask.userid});
                //return json(res, resultAppend({userId: metamask.userid}, true));
                // FIXME : login이랑 create 구분 어떻게 하징
                // TODO : True 시 db 내 고유 id를 리턴해야함
            } catch
                (err) {
                json(res, resultAppend({}, false, `${err}`), 400);
            }
        }
    }

    
    public getNonce() {
        return async (req: Request, res: Response) => {
            try
            {
                if(!(Object.keys(this.nonces).includes(req.params.address))) //등록된 Address가 없는 경우 생성
                {
                    this.nonces[req.params.address] = Math.floor(Math.random() * 1000000) // new nonce
                }
                res.send(this.nonces[req.params.address]);
            }
            catch (err)
            {
                console.log(err);
            }
        }
    }

    //userid 관련 세션 체크 기능도 있어야하는데 user directory 내에서 확인해야할 듯

    public deleteUser() {
        return async (req: Request, res: Response) => {
            try {
                const reqData = req.body;
                return json(res, resultAppend({}, true));
                // TODO : 메타마스크 연결 사이트 해제 뭐 이런 업데이트는 할 수 있어도 나머지 정보들 없앨 필요는 없을듯
            } catch
                (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public getMetamaskData()
    {
        return async (req: Request, res: Response) => {
            const address = req.params.address;
            res.send(await metamaskService.getMetamaskData(address));
        }
    }


}

export const metamask = new MetamaskController(metamaskService);
