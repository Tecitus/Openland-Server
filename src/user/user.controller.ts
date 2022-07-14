import {NextFunction, Request, RequestHandler, Response} from 'express';
import {userService, UserService} from './user.service';
import {SocialUser, User} from './user';
import {isPresent, necessary, resultAppend} from '../common/util';
import {email} from '../common/email/email';
import {socialService, SocialService} from './social.service';
import {commonService} from '../common/common.service';
import * as querystring from 'querystring';
import {appConfig} from '../app-config';
import {json} from "../common/controller";

export class UserController {
    constructor(
        private userService: UserService,
        private socialService: SocialService,
    ) {
    }

    public create() {
        return async (req: Request, res: Response) => {
            try {
                const reqUser: User = req.body;
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
    }

    public snsTerm() {
        return async (req: Request, res: Response) => {
            try {
                const requestUser = res.locals.user;
                await this.userService.socialUpdateForMkt(requestUser.id, req.body.mkt);
                const newData: User = await this.userService.findById(Number(requestUser.id));
                const userInfo = await this.userService.tokenCookieResult(newData, res, false);
                const result = resultAppend(userInfo, true);
                json(res, {...result, signup: true});
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        };
    }

    public update() {
        return async (req: Request, res: Response) => {
            try {
                const requestUser = res.locals.user;
                if (requestUser.id !== Number(req.params.id)) {
                    throw new Error('요청자 오류!');
                } else {
                    const inputUser = new User();
                    inputUser.id = Number(req.params.id);
                    if (req.body.nickname) {
                        inputUser.nickname = req.body.nickname;
                    }
                    if (req.body.username) {
                        inputUser.username = req.body.username;
                    } else {
                        inputUser.username = 'null';
                    }
                    if (req.body.password) {
                        inputUser.password = req.body.password;
                    }
                    if (isPresent(req.body.mkt)) {
                        inputUser.mkt = req.body.mkt ? 'Y' : 'N';
                    }
                    await this.userService.userUpdate(inputUser);
                    const usr: User = await this.userService.findById(inputUser.id);
                    const userInfo = await this.userService.tokenCookieResult(usr, res, false);
                    const result = resultAppend(userInfo, true);
                    json(res, result);
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        };
    }

    public login(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const data: User | null = await this.userService.findByEmail(req.body.email);
                if (!data) {
                    throw new Error('아이디와 비밀번호가 맞지 않습니다!');
                } else if (!data.password) {
                    throw new Error('소셜로그인으로만 가입되어 있습니다! 소셜로그인 후 패스워드를 등록해 주세요!');
                }
                const keep = req.body.keep;
                const usr: User = await this.userService.checkPassword(req.body, data);
                const userInfo: any = await this.userService.tokenCookieResult(usr, res, keep);
                const result = resultAppend(userInfo, true);
                json(res, result);
                if (result) {
                    await this.userService.setLastLogin(usr.id);
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    /*
    public teacherlogin(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const data: User | null = await this.userService.findByEmail(req.body.email);
                if (!data) {
                    throw new Error('아이디와 비밀번호가 맞지 않습니다!');
                } else if (!data.password) {
                    throw new Error('소셜로그인으로만 가입되어 있습니다! 소셜로그인 후 패스워드를 등록해 주세요!');
                } else if (data.verification === 'N') {
                    throw new Error('이메일 인증이 되어 있지 않습니다.');
                }
                const usr: User = await this.userService.checkPassword(req.body, data);
                const keep = req.body.keep;
                const info = await this.userService.getTeacherInfo(usr, res, keep);
                const result = resultAppend(info, true);
                json(res, result);
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }
    */

    public logout(): RequestHandler {
        return (req: Request, res: Response) => {
            this.userService.logout(res);
            const result = resultAppend({}, true);
            json(res, result);
        };
    }

    public refresh(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const decodedPayload: any = res.locals.user;
                const usr: User = await this.userService.findById(Number(decodedPayload.id));
                await this.userService.verify(decodedPayload, usr);
                const userInfo = await this.userService.tokenCookieResult(usr, res, false);
                const result = resultAppend(userInfo, true);
                json(res, result);
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    public refreshCall(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const decodedPayload: any = res.locals.user;
                await this.userService.tokenCookieResult(decodedPayload, res, decodedPayload.keep);
                const result = resultAppend({}, true);
                json(res, result);
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    /*
    public teacherRefresh(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const decodedPayload: any = res.locals.user;
                const usr: User = await this.userService.findById(Number(decodedPayload.id));
                await this.userService.verify(decodedPayload, usr);
                const info = await this.userService.tokenCookieResult(usr, res, decodedPayload.keep);
                let courses: Teacher[] = [];
                if (res.locals.user.teachingCourse[0].level === 0) {
                    courses = await this.userService.getCourseList();
                }
                const userInfo = {
                    ...info.userInfo,
                    teacherOf: res.locals.user.teachingCourse,
                    level: res.locals.user.level
                };
                const returnValue = {
                    userInfo,
                    courseList: courses,
                };
                const result = resultAppend(returnValue, true);
                json(res, result);
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }
    */

    public sendEmailVerification(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                await this.userService.sendEmailVerification(res.locals.user);
                json(res, resultAppend({}, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 404);
            }
        };
    }

    public confirmEmailVerification(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const uid = req.body.uid;
                const userId = await commonService.checkUid(uid);
                const originUser: User = await this.userService.findById(userId);
                await commonService.deleteUid(uid);
                const inputUser = new User();
                inputUser.id = originUser.id;
                inputUser.verification = 'Y';
                await this.userService.userUpdate(inputUser);
                json(res, resultAppend({}, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 404);
            }
        };
    }

    public sendPhoneVerification(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                await this.userService.sendPhoneVerification(res.locals.user.id, req.body.phone);
                json(res, resultAppend({}, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 404);
            }
        };
    }

    public confirmPhoneVerification(): RequestHandler {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const verificationNumber = Number(req.body.verificationNumber);
                const phone = String(req.body.phone);
                const checkOk: boolean = await commonService.checkLimitNumber(res.locals.user.id, verificationNumber);
                if (checkOk) {
                    const inputUser = new User();
                    inputUser.id = res.locals.user.id;
                    inputUser.phone = phone;
                    await this.userService.userUpdate(inputUser);
                } else {
                    throw new Error('인증번호 확인 오류!');
                }
                const usr: User = await this.userService.findById(res.locals.user.id);
                const userInfo = await this.userService.tokenCookieResult(usr, res, false);
                const result = resultAppend(userInfo, true);
                json(res, result);
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 404);
            }
        };
    }

    public facebookLogin(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const customParams: any = querystring.parse(req.query.state as string);
                const accessToken: string = await this.socialService.facebookGetAccessToken(req.query.code);
                const socialUser: SocialUser = await this.socialService.facebookMe(accessToken);
                await this.userService.socialProcess(res, socialUser, customParams);
            } catch (err) {
                res.redirect('https://www.sundaynamaste.com/login?error=' + err);
            }
        };
    }

    public naverLogin(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const customParams: any = querystring.parse(req.query.state as string);
                customParams.redirect = req.query.redirect;
                const accessToken: string = await this.socialService.naverGetAccessToken(req.query);
                const socialUser: SocialUser = await this.socialService.naverMe(accessToken);
                await this.userService.socialProcess(res, socialUser, customParams);
            } catch (err) {
                res.redirect('https://www.sundaynamaste.com/login?error=' + err);
            }
        };
    }

    public kakaoLogin(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const customParams: any = querystring.parse(req.query.state as string);
                const accessToken: string = await this.socialService.kakaoGetAccessToken(req.query.code);
                const socialUser: SocialUser = await this.socialService.kakaoMe(accessToken);
                await this.userService.socialProcess(res, socialUser, customParams);
            } catch (err) {
                res.redirect('https://www.sundaynamaste.com/login?error=' + err);
            }
        };
    }

    public authGuard(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const decodedPayload: any = await this.userService.securityGuard(req, res);
                if (decodedPayload) {
                    res.locals.user = await decodedPayload;
                    return next();
                } else {
                    throw new Error('no user information');
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    public authCheck(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const decodedPayload: any = await this.userService.checkGuard(req, res);
                if (decodedPayload) {
                    res.locals.user = await decodedPayload;
                    return next();
                } else {
                    return next();
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    public getLevel(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const teachers: any = await this.userService.getTeacher(res.locals.user.id);
                if (isPresent(teachers[0].level)) {
                    res.locals.user.level = teachers[0].level;
                    res.locals.user.teachingCourse = teachers;
                    return next();
                } else {
                    throw new Error('no level information');
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    public checkKeyword(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            function compareEmail(keyword: string): any {
                return new Promise((resolve) => {
                    resolve(keyword === req.query.keyword);
                });
            }

            try {
                if (res.locals.user.level === 0) {
                    return next();
                }
                const ps = [];
                // for (let i = 0; i < res.locals.personal.teachingCourse.length; i++) {
                //     ps.push(compareEmail(res.locals.personal.teachingCourse[i].course_keyword));
                // }
                for (const course of res.locals.user.teachingCourse) {
                    ps.push(compareEmail(course.course_keyword));
                }
                const promiseYours = await Promise.all(ps);
                const yours = promiseYours.some((y) => y === true);

                if (!yours) {
                    throw new Error('not my information');
                } else {
                    return next();
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }
    /*
    public checkClassId(): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            const classId = Number(req.params.id);

            function compareEmail(usrId: number): any {
                return new Promise((resolve) => {
                    resolve(res.locals.user.id === usrId);
                });
            }

            try {
                if (res.locals.user.level === 0) {
                    return next();
                }

                const classTeachers: any[] = await this.courseService.getYclassTeacher(classId);

                const ps = [];
                for (const course of classTeachers) {
                    ps.push(compareEmail(course.user_id));
                }
                const promiseYours = await Promise.all(ps);
                const yours = promiseYours.some((y) => y === true);

                if (!yours) {
                    throw new Error('not my information');
                } else {
                    return next();
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }*/

    public checkMaster(): RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if (res.locals.user.level === 0) {
                    return next();
                } else {
                    throw new Error('no master');
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    public checkVersion(): RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if (req.body.version === appConfig.getConfig.version) {
                    return next();
                } else {
                    throw new Error(
                        '화면을 리로딩 후 다시 시도해 주세요.<br/>모바일에서는 화면을 손으로 아래로 끌고, PC에서는 Shift + F5키를 눌러주세요'
                    );
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 401);
            }
        };
    }

    public authGuardForPassword() {
        return async (req: Request, res: Response, next: NextFunction) => {
            if (req.body.uid) {
                return next();
            } else {
                try {
                    const decodedPayload: any = await this.userService.securityGuard(req, res);
                    if (decodedPayload) {
                        res.locals.user = decodedPayload;
                        return next();
                    } else {
                        throw new Error('no user information');
                    }
                } catch (err) {
                    json(res, resultAppend({}, false, `${err.message}`), 401);
                }
            }
        };
    }

    public authGuardForUpdatePassword() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const decodedPayload: any = await this.userService.securityGuard(req, res);
                if (decodedPayload) {
                    res.locals.user = decodedPayload;
                    const data: User = await this.userService.findById(Number(res.locals.user.id));
                    if (data.password) {
                        const inputUser = new User();
                        inputUser.password = await req.body.oldpassword;
                        await this.userService.checkPassword(inputUser, data);
                    }
                    return next();
                } else {
                    throw new Error('no user information');
                }
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 412);
            }
        };
    }

    public forgotpassword(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const data: User | null = await this.userService.findByEmail(req.body.email);
                if (!data) {
                    throw new Error('가입되지 않은 메일 입니다.');
                }
                await commonService.deleteUidByUserId(data.id);

                const tempurl = await commonService.createPasswordResetUrl(data);
                const emailValues = {
                    url: tempurl,
                    name: data.username ? data.username : data.nickname,
                };
                await email.sendMail(
                    'sundaynamaste<noreply@sundaynamaste.com>',
                    req.body.email,
                    '[sundaynamaste] Password Reset',
                    'reset',
                    emailValues
                );
                json(res, resultAppend({}, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        };
    }

    public resetPassword(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const inputUser = new User();
                if (req.body.uid) {
                    const userId: string = await commonService.checkUid(req.body.uid);
                    const targetUser: User = await this.userService.findById(userId);
                    await commonService.deleteUid(req.body.uid);
                    inputUser.id = targetUser.id;
                    inputUser.password = await req.body.password;
                } else {
                    inputUser.id = await res.locals.user.id;
                    inputUser.password = await req.body.password;
                }
                inputUser.verification = 'Y';
                await this.userService.userUpdate(inputUser);
                json(res, resultAppend({}, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        };
    }
    /*
    public getGiftInfo(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                await necessary(req.params.id);
                const giftInfo = await this.courseService.getGiftInfoWithoutPhone(req.params.id);
                json(res, resultAppend(giftInfo, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        };
    }

    public setGift(): RequestHandler {
        return async (req: Request, res: Response) => {
            try {
                const userId = res.locals.user.id;
                const giftId = req.body.giftId;
                await necessary(giftId);
                await this.courseService.setGift(userId, giftId);
                json(res, resultAppend({}, true));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`));
            }
        };
    }*/
}

export const user = new UserController(userService, socialService);
