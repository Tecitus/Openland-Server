import {NextFunction, Request, RequestHandler, Response} from 'express';
import {isPresent, necessary, resultAppend} from '../common/util';
import {email} from '../common/email/email';
import {metamaskService, MetamaskService} from './metamask.service';
import {commonService} from '../common/common.service';
import * as querystring from 'querystring';
import {appConfig} from '../app-config';
import {Metamask} from "./metamask";
import {json} from "../common/controller";
//https://blog.devgenius.io/authenticating-users-to-your-web-app-using-metamask-and-nodejs-e920e45e358 참조
export class MetamaskController {
    constructor(
        private metamaskService: MetamaskService
    ) {
    }

// 1. 메타마스크 connect 확인 2. 연결 후 메타마스크 address 아카이빙
// join에서 metamask error 뜰 필요가 없음 걍 연결해주면 됨
    public joinOrLogin() {
        return async (req: Request, res: Response) => {
            try {
                const reqData = req.body;
                const usr = await this.metamaskService.checkUserExist(reqData.address)
                let id: number;
                if (usr) {
                    //TODO : 로그인 성공한 경우 nonce 값 Math.floor(Math.random() * 1000000) 로 갱신
                    id = await this.metamaskService.userLogin(reqData)
                } else {
                    await this.metamaskService.userCreate(reqData)
                }
                return json(res, resultAppend({userId: id}, true));
                // FIXME : login이랑 create 구분 어떻게 하징
                // TODO : True 시 db 내 고유 id를 리턴해야함
            } catch
                (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    
    public getNonce() {
        return async (req: Request, res: Response) => {
            try
            {
                if(!(req.params.address in app.data.users)) //등록된 Address가 없는 경우 생성
                {
                    //app.data.users[req.params.wallet_address] = Math.floor(Math.random() * 1000000); // new nonce
                }
                await res.send(`Nonce: ${app.data.users[req.params.wallet_address]}`);
            }
            catch (err)
            {

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


}

export const metamask = new MetamaskController(metamaskService);
