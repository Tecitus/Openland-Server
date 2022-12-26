import {NextFunction, Request, RequestHandler, Response} from 'express';
import {userService, UserService} from './user.service';
import {User} from './user';
import {resultAppend} from '../common/util';
import {metamaskService, MetamaskService} from '../metamask/metamask.service'
import * as querystring from 'querystring';
import {appConfig} from '../app-config';
import {json} from "../common/controller";
import { Metamask } from '../metamask/metamask';
import { ifError } from 'assert';
import { web3, web3Service } from '../solidity/Web3Service';


export class UserController {
    constructor(
        private userService: UserService,
        private metamaskService : MetamaskService
    ) {
    }

    public registerUser(): RequestHandler {
        return async (req: Request, res: Response) => {
            try{
                //@ts-ignore
                if(req.session.user)
                {
                    res.send("Already signed in.")
                }
                const username = req.body.username;
                const rawpassword = req.body.password;
                const nickname = req.body.nickname;
                const email = req.body.email;
                const filename = req.file.filename;
                const metamaskaddress = req.body.address;
                console.log(username, rawpassword, nickname, email, metamaskaddress, filename);
                const user = await this.userService.createNewUser({
                    email: email,
                    password: rawpassword,
                    nickname: nickname,
                    username: username,
                    picture: filename
                });

                if(metamaskaddress){
                    const metamask = await metamaskService.createMetamaskData(metamaskaddress, user.id);
                    if(metamask == null || metamask == undefined)
                    {
                        res.send("Something is wrong.");
                        return;
                    }
                }

                res.send("Success");
            }
            catch(err)
            {
                console.log(err);
                json(res, resultAppend({}, false, `${err.message}`));
            }
        }
    }

    public signIn() : RequestHandler
    {
        return async (req: Request, res: Response) =>
        {
            try{
                //@ts-ignore
                if(req.session.user)
                {
                    res.send("Already Signed in");
                    return;
                }
                const user : User = (await this.userService.findUserData({
                    username: req.body.id,
                }))[0];

                if(user == undefined || user == null)
                {
                    res.send("ID or Password is wrong.");
                    return;
                }

                if(!this.userService.authPassword(req.body.password, user))
                {
                    res.send("ID or Password is wrong.");
                    return;
                }

                //@ts-ignore
                req.session.user = user;

                const metamasks = await this.metamaskService.getMetamaskDataWithUserId(user.id);
                if(metamasks.length != 0)
                {
                    //@ts-ignore
                    req.session.metamasks = metamasks;
                }

                res.send("Success");
                
            }
            catch(err)
            {
                console.log(err)
                json(res, resultAppend({}, false, `${err.message}`));
            }
        }
    }

    public logout()
    {
        return async (req: Request, res: Response) =>
        {
            //@ts-ignore
            if(!req.session.user)
            {
                res.send("Something is wrong");
            }
            else {
                req.session.destroy(undefined);
                res.send("Success");
            }
        }
    }

    public getUserData(): RequestHandler
    {
        return async (req: Request, res: Response) =>
        {
            try{
                const userid = Number(req.params.id);
                const result = await this.userService.getUserData(userid);
                res.send({id: result.id, email:result.email, nickname:result.nickname, username: result.username, picture: result.picture});
            }
            catch(err)
            {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        }
    }

    public getProfileData()
    {
        return async (req: Request, res: Response) =>
        {
            try{
                const userid = Number(req.params.id);
                let result = await this.userService.getUserData(userid) as any;
                delete result.password;
                delete result.salt;
                result = Object.assign(result,await this.userService.getProfileData(userid));
                //@ts-ignore
                if(req.session.user && req.session.user.id == result.id)
                {
                    const address = (await metamaskService.getMetamaskDataWithUserId(result.id))[0];
                    result.balance = web3.utils.fromWei(await web3.eth.getBalance(address.address),'ether')
                }
                res.send(result);
            }
            catch(err)
            {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        }
    }

    public getSessionData() : RequestHandler
    {
        return async (req: Request, res: Response) =>
        {
            try{
                //@ts-ignore
                if(req.session.user)
                {
                    //@ts-ignore
                    const user = req.session.user as User;
                    const address = (await metamaskService.getMetamaskDataWithUserId(user.id))[0];
                    res.send({
                        id: user.id,
                        nickname: user.nickname,
                        username: user.username,
                        picture: user.picture,
                        balance: web3.utils.fromWei(await web3.eth.getBalance(address.address),'ether')
                    });
                }
                else
                {
                    res.send(undefined);
                }
            }
            catch(err)
            {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        }
    }
}

export const user = new UserController(userService,metamaskService);
