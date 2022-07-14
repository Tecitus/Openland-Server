import {Request, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import {TokenExpiredError} from 'jsonwebtoken';
import {SocialUser, socialUserToUser, User} from './user';
import {appConfig} from '../app-config';
import {decrypt, encrypt, isPresent} from '../common/util';
import {UserRepository} from './user.repository';
//import {Teacher} from '../course/teacher';
import {email} from '../common/email/email';
//import {kakaoTalk} from '../common/kakao/kakaoTalk';
import {commonService} from '../common/common.service';
import {PoolConnection} from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import {nanoid} from 'nanoid/non-secure';
import {CookieOptions} from 'express-serve-static-core';

export class UserService {
    constructor(private userRepository: UserRepository) {
    }

    public checkPassword(inputUser: User, getUser: User): any {
        return new Promise((resolve, reject) => {
            if (!getUser) {
                throw new Error('Email과 Password가 맞지 않아요!');
            } else {
                if (!inputUser.password) {
                    throw new Error('No password!');
                }
                if (!getUser.password) {
                    throw new Error('Email과 Password가 맞지 않아요!');
                }

                this.compareHash(inputUser.password, getUser.password).then(
                    (res: any) => {
                        if (res) {
                            return resolve(getUser);
                        } else {
                            reject(new Error('Email과 Password가 맞지 않아요!'));
                        }
                    },
                    (err: any) => {
                        throw new Error('Error on compareHash! ' + err);
                    }
                );
            }
        });
    }

    public makeAccessToken(getUser: User, keep: boolean): any {
        try {
            const token = jwt.sign(
                {
                    id: getUser.id,
                    email: getUser.email,
                    nickname: getUser.nickname,
                    phone: getUser.phone,
                    keep: keep,
                },
                appConfig.getConfig.jwt.accessTokenSecret,
                {
                    expiresIn: '1h',
                }
            );
            return Promise.resolve(token);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public makeRefreshToken(getUser: User, keep: boolean): any {
        const expire = keep ? '365d' : '1h';
        try {
            const token = jwt.sign(
                {
                    id: getUser.id,
                    keep: keep,
                },
                appConfig.getConfig.jwt.refreshTokenSecret,
                {
                    expiresIn: expire,
                }
            );
            return Promise.resolve(token);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public compareHash(inputValue: string, hashedValue: string) {
        return new Promise((resolve) => {
            bcrypt.compare(inputValue, hashedValue).then((res: boolean) => {
                resolve(res);
            });
        });
    }

    private decodeAccessToken(token: string): any {
        return new Promise((resolve, reject) => {
            jwt.verify(token, appConfig.getConfig.jwt.accessTokenSecret, (err: Error, decoded: any) => {
                if (err) {
                    if (err instanceof TokenExpiredError) {
                        reject(new Error('로그인이 만료되었습니다'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    public decodeRefreshToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, appConfig.getConfig.jwt.refreshTokenSecret, (err: Error, decoded: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    public verify(decodedPayload: any, usr: User | null) {
        if (usr === null || usr.email !== decodedPayload.email || usr.nickname !== decodedPayload.nickname) {
            throw new Error('토큰인증오류!');
        }
        return Promise.resolve();
    }

    public async securityGuard(req: Request, res?: Response) {
        try {
            const login = req.cookies['_vandt'];
            const accessToken: string = req.cookies['_ACCESS-TOKEN'];
            const refreshToken = req.cookies['_REFRESH-TOKEN'];
            if (!accessToken || !login) {
                if (refreshToken) {
                    const decoded = await this.decodeRefreshToken(refreshToken);
                    if (decoded && res) {
                        const thisUser: User = await this.findById(decoded.id);
                        await this.tokenCookieResultReturnToken(thisUser, res, decoded.keep);
                        return Promise.resolve(thisUser);
                    } else {
                        return Promise.reject(new Error('로그인이 되어있지 않습니다'));
                    }
                } else {
                    return Promise.reject(new Error('로그인이 되어있지 않습니다'));
                }
            } else {
                const decodedPayload = this.decodeAccessToken(accessToken);
                return Promise.resolve(decodedPayload);
            }
        } catch (e) {
            if (e instanceof TokenExpiredError) {
                return Promise.reject(new Error('로그인이 만료되었습니다'));
            }
            return Promise.reject(e);
        }
    }

    public async checkGuard(req: Request, res?: Response) {
        try {
            const login = req.cookies['_vandt'];
            const accessToken: string = req.cookies['_ACCESS-TOKEN'];
            const refreshToken = req.cookies['_REFRESH-TOKEN'];
            if (!accessToken || !login) {
                if (refreshToken) {
                    const decoded = await this.decodeRefreshToken(refreshToken);
                    if (decoded && res) {
                        const thisUser: User = await this.findById(decoded.id);
                        await this.tokenCookieResultReturnToken(thisUser, res, decoded.keep);
                        return Promise.resolve(thisUser);
                    } else {
                        return Promise.resolve(null);
                    }
                } else {
                    return Promise.resolve(null);
                }
            } else {
                const decodedPayload = this.decodeAccessToken(accessToken);
                return Promise.resolve(decodedPayload);
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    public async userUpdateWhenJoinClass(userId: number, userData: any, conn: PoolConnection) {
        const upUser = new User();
        upUser.id = userId;
        if (userData?.username) {
            upUser.username = userData.username;
        }
        if (userData?.gender) {
            upUser.gender = userData.gender;
        }
        return await this.userUpdate(upUser, conn);
    }

    public async userCreate(user: User): Promise<number> {
        try {
            let cred = Object.assign(
                {},
                {email: user.email},
                {username: user.username},
                {nickname: user.nickname},
                {gender: user.gender},
                {term: user.term},
                {mkt: user.mkt}
            );

            if (user.password) {
                const enc = await UserService.makeHash(user.password);
                cred = Object.assign(cred, {pwd: enc});
            }
            if (user.verification) {
                cred = Object.assign(cred, {verification: user.verification});
            }
            if (user.picture) {
                user.picture = user.picture.replace('http://', '//').replace('https://', '//');
                cred = Object.assign(cred, {picture: user.picture});
            }
            if (!user.nickname) {
                cred = Object.assign(cred, {nickname: nanoid(10)});
            }
            return await this.userRepository.insertUser(cred);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async providerCreate(user: SocialUser): Promise<any> {
        const cred = Object.assign(
            {},
            {userId: user.userId},
            {type: user.type},
            {providerId: user.providerId},
            {email: user.email}
        );
        await this.userRepository.insertUserProvider(cred);
        return await Promise.resolve();
    }

    public async createLocalUser(reqUser: User) {
        const userId: number = await this.userCreate(reqUser);
        const user = Object.assign(
            {},
            {userId: userId},
            {type: 'local'},
            {providerId: userId},
            {email: reqUser.email}
        );
        return await this.providerCreate(user);
    }

    public async socialUpdateForMkt(userId: number, mkt: string): Promise<any> {
        return await this.userRepository.socialUpdateForMkt(userId, mkt);
    }

    public async findByEmail(email: string): Promise<User | null> {
        try {
            const result: User | null = await this.userRepository.findByEmail(email);
            if (isPresent(result)) {
                const findedUser: User = await UserService.decryptPhoneNumber(result);
                return Promise.resolve(findedUser);
            } else {
                return Promise.resolve(null);
            }
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }

    public async findById(id: any): Promise<User> {
        try {
            const result: User | null = await this.userRepository.findById(Number(id));

            if (isPresent(result)) {
                const findedUser = await UserService.decryptPhoneNumber(result);
                return Promise.resolve(findedUser);
            } else {
                return Promise.reject(new Error('사용자 확인 오류'));
            }
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }

    public async findBySocialId(socialUser: SocialUser): Promise<User | null> {
        try {
            const result: User | null = await this.userRepository.findBySocialId(socialUser);
            if (isPresent(result)) {
                const findedUser = await UserService.decryptPhoneNumber(result);
                return Promise.resolve(findedUser);
            } else {
                return Promise.resolve(null);
            }
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }

    public async socialDataUpdate(socialUser: SocialUser, customParams: any): Promise<[User, boolean]> {
        let alreadySignup = false;
        const data: User | null = await this.findBySocialId(socialUser);
        let newData: User = new User();
        if (data) {
            // 이미 가입 -> 아무것도 안함
            newData = data;
            alreadySignup = true;
        } else if (!data) {
            const data2 = await this.findByEmail(socialUser.email);
            if (data2) {
                // 이 소셜 추가
                socialUser.userId = data2.id;
                await this.providerCreate(socialUser);
                newData = data2;
                alreadySignup = true;
            } else {
                newData = await this.joinNewSocialUser(newData, socialUser, customParams);
            }
        }
        return [newData, alreadySignup];
    }

    public async socialLoginRedirect(
        user: User,
        res: Response,
        alreadySignup: boolean,
        customParams: any
    ): Promise<void> {
        const redirect = customParams.redirect === 'null' ? '' : customParams.redirect;
        if (alreadySignup || customParams.mkt === 'Y' || customParams.mkt === 'N') {
            if (process.env.NODE_ENV === 'production') {
                res.redirect('https://www.sundaynamaste.com' + redirect);
            } else {
                res.redirect('http://localhost:4200' + redirect);
            }
        } else {
            if (process.env.NODE_ENV === 'production') {
                res.redirect('https://www.sundaynamaste.com/signup?redirect=' + encodeURIComponent(redirect));
            } else {
                res.redirect('http://localhost:4200/signup?redirect=' + encodeURIComponent(redirect));
            }
        }
        return await Promise.resolve();
    }

    public async userUpdate(user: User, conn?: any) {
        let cred = {
            ...(user.nickname && {nickname: user.nickname}),
            ...(user.username && user.username === 'null' && {username: null}),
            ...(user.username && user.username !== 'null' && {username: user.username}),
            ...(user.gender && {gender: user.gender}),
            ...(user.verification && {verification: user.verification}),
            ...(user.mkt && {mkt: user.mkt}),
        };
        if (user.phone) {
            await encrypt(user.phone).then((enc) => {
                cred = Object.assign(cred, {phone: enc});
            });
        }
        if (user.password) {
            await UserService.makeHash(user.password).then((enc) => {
                user.password = enc;
            });
            cred = Object.assign(cred, {pwd: user.password});
        }
        if (user.picture && user.picture.length > 0) {
            user.picture = user.picture.replace('http://', '//').replace('https://', '//');
            cred = Object.assign(cred, {picture: user.picture});
        }
        return await this.userRepository.updateUser(user.id, cred, conn);
    }
    /*
    public async getTeacherInfo(usr: User, res: Response, keep: boolean) {
        const teacherInfo: any = await this.userRepository.getCourseTeacherListByUserId(usr.id);
        if (!isPresent(teacherInfo) || teacherInfo.length < 1) {
            throw new Error('선생님 권한이 없습니다!!');
        }
        let courses: Teacher[] = [];
        if (teacherInfo[0].level === 0) {
            courses = await this.getCourseList();
        }
        const userInfo = await this.tokenCookieResult(usr, res, keep);
        return {
            userInfo: {
                ...userInfo.userInfo,
                teacherOf: teacherInfo,
                level: teacherInfo[0].level,
            },
            courseList: courses,
        };
    }*/

    public async tokenCookieResult(usr: User | null, res: Response, keep: boolean) {
        if (!usr) {
            throw Error('유저 정보가 없습니다');
        }
        const accessToken = await this.makeAccessToken(usr, keep);
        const refreshToken = await this.makeRefreshToken(usr, keep);
        await this.generateCookie(res, accessToken, refreshToken, keep);
        const userInfo = {
            userInfo: {
                id: usr.id,
                email: usr.email,
                nickname: usr.nickname,
                username: usr.username,
                phone: usr.phone,
                gender: usr.gender,
                picture: usr.picture,
                verification: usr.verification,
                mkt: usr.mkt,
                level: usr.level,
            },
        };
        return userInfo;
    }

    public async tokenCookieResultReturnToken(usr: User | null, res: Response, keep: boolean) {
        if (!usr) {
            throw Error('유저 정보가 없습니다');
        }
        const accessToken = await this.makeAccessToken(usr, keep);
        const refreshToken = await this.makeRefreshToken(usr, keep);
        await this.generateCookie(res, accessToken, refreshToken, keep);
        return await Promise.resolve();
    }

    public getTeacher(id: any) {
        return this.userRepository.getCourseTeacherListByUserId(id);
    }

    public getCourseList() {
        return this.userRepository.getCourseList();
    }

    async setLastLogin(userId: number): Promise<void> {
        await this.userRepository.setLastLogin(userId);
    }

    async sendEmailVerification(usr: any): Promise<void> {
        const verificationUrl: string = await commonService.createEmailVerificationUrl(usr);
        const emailValues = {url: verificationUrl};
        await email.sendMail(
            'sundaynamaste<noreply@sundaynamaste.com>',
            usr.email,
            '[sundaynamaste] 이메일 인증',
            'verification',
            emailValues
        );
    }

    async sendPhoneVerification(userId: string, phonenumber: string): Promise<void> {
        const verificationNumber: number = await commonService.createRandomNumber(userId);
        //await kakaoTalk.sendAlimtalkPhoneVerification(phonenumber, verificationNumber);
    }

    async socialProcess(res: Response, socialUser: SocialUser, customParams: any): Promise<void> {
        const [newUser, alreadySignup] = await this.socialDataUpdate(socialUser, customParams);
        const keep = customParams.keep === 'Y';
        await this.tokenCookieResult(newUser, res, keep);
        await this.socialLoginRedirect(newUser, res, alreadySignup, customParams);
        await this.setLastLogin(newUser.id);
    }

    private generateCookie(res: Response, accessToken: string, refreshToken: string, keep: boolean): Promise<void> {
        let domainString;
        let secureBool;
        if (process.env.NODE_ENV === 'production') {
            domainString = 'sundaynamaste.com';
            secureBool = true;
        } else {
            domainString = 'localhost';
            secureBool = false;
        }
        const day365 = 365 * 24 * 60 * 60 * 1000;
        const hour1 = 60 * 60 * 1000;
        const expireForOpen = keep ? day365 : hour1;
        const expire = keep ? day365 : undefined;
        res.cookie('_vandt', '0.0.3', {
            domain: domainString,
            path: '/',
            maxAge: expireForOpen,
            secure: secureBool,
            httpOnly: false,
            sameSite: false,
        });
        const refreshTokenOptionsPre = {
            domain: domainString,
            path: '/',
            secure: secureBool,
            httpOnly: true,
            sameSite: true,
        };
        const refreshTokenOptions: CookieOptions = expire
            ? {...refreshTokenOptionsPre, ...{maxAge: expire}}
            : refreshTokenOptionsPre;
        res.cookie('_REFRESH-TOKEN', refreshToken, refreshTokenOptions);
        res.cookie('_ACCESS-TOKEN', accessToken, {
            domain: domainString,
            path: '/',
            maxAge: hour1,
            secure: secureBool,
            httpOnly: true,
            sameSite: true,
        });
        return Promise.resolve();
    }

    logout(res: Response) {
        let domainString;
        let secureBool;
        if (process.env.NODE_ENV === 'production') {
            domainString = 'sundaynamaste.com';
            secureBool = true;
        } else {
            domainString = 'localhost';
            secureBool = false;
        }

        res.cookie('_vandt', '', {
            domain: domainString,
            path: '/',
            maxAge: 0,
            secure: secureBool,
            httpOnly: false,
            sameSite: false,
        });
        res.cookie('_ACCESS-TOKEN', null, {
            domain: domainString,
            path: '/',
            maxAge: 0,
            secure: secureBool,
            httpOnly: true,
            sameSite: true,
        });
        res.cookie('_REFRESH-TOKEN', null, {
            domain: domainString,
            path: '/',
            maxAge: 0,
            secure: secureBool,
            httpOnly: true,
            sameSite: true,
        });
    }

    private static async decryptPhoneNumber(result: any): Promise<User> {
        let decryptPhone: string = result?.phone as string;
        if (result?.phone && result.phone.length > 0) {
            decryptPhone = await decrypt(result.phone);
        }
        const findedUser: User = await {...result, ...{password: result.pwd, phone: decryptPhone}};
        return Promise.resolve(findedUser);
    }

    private static async makeHash(value: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(10);
            const res = await bcrypt.hash(value, salt);
            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }

    async joinNewSocialUser(newData: User, socialUser: SocialUser, customParams: any) {
        newData = socialUserToUser(socialUser);
        newData.term = customParams.mkt && (customParams.mkt === 'Y' || customParams.mkt === 'N') ? 'Y' : 'N';
        newData.mkt = customParams.mkt === 'Y' ? 'Y' : 'N';
        const userId: number = await this.userCreate(newData);
        socialUser.userId = userId;
        await this.providerCreate(socialUser);
        newData.id = userId;
        return newData;
    }
}

export const userService = new UserService(new UserRepository());
