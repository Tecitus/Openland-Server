import {NextFunction, Request, RequestHandler, Response} from 'express';
import {isPresent, necessary, resultAppend} from '../common/util';
import {email} from '../common/email/email';
import {nftService, NftService} from './nft.service';
import {userService, UserService} from '../user/user.service';
import {commonService} from '../common/common.service';
import * as querystring from 'querystring';
import {appConfig} from '../app-config';
import {User} from '../user/user'
import {Nft, nft} from './nft'

export class NftController {
    constructor(
        private nftService: NftService,
        private nft: Nft,
        private userService: UserService
    ) {
    }

    //TODO: 작성, UserService 필요 없는 경우 제거

    // 각 nft crud - nft ipfs 연결 & collection 정보 crud
    // nft collection 구성요소별 db 구조
    //remix 거랑 연결해서 각 nft 블록체인 데이타 가져오기
    // create시 ipfs에 넣고넣고 넣고 난 대가리가 없고
    // asset 페이지 해야함 여튼 그럼


    /*
    public create() {
        return async (req: Request, res: Response) => {
            try {
                const reqUser: Nft = req.body;
                const data: User | null = await this.userService.findByEmail(reqUser.email);
                if (data) {
                    throw new Error('이미 가입된 Email 이에요!');
                } else {
                    reqUser.term = req.body.term === true ? 'Y' : 'N';
                    reqUser.mkt = req.body.mkt === true ? 'Y' : 'N';
                    await this.userService.createLocalUser(reqUser);
                }
                const usr: User | null = await this.userService.findByEmail(reqUser.email);
                if (usr) {
                    await this.userService.sendEmailVerification(usr);
                    json(res, resultAppend({signup: true}, true));
                    await this.userService.setLastLogin(usr.id);
                } else {
                    throw new Error('유저 확인 오류입니다');
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        };
    }*/

    public create() {
        return async (req: Request, res: Response) => {
            try {
                const reqUser: Nft = req.body;
            } catch (err) {
                null;
            }
        };
    }
}

export const nftController = new NftController(nftService, nft, userService);
