//import {SocialUser} from './user';
import * as requestPromise from 'request-promise-native';
import {appConfig} from '../app-config';
import {UserRepository} from './user.repository';
import {nanoid} from 'nanoid/non-secure';

export class SocialService {
    constructor(private userRepository: UserRepository) {
    }

    /*
    public async facebookGetAccessToken(code: any): Promise<string> {
        try {
            const CLIENT_ID = appConfig.getConfig.federations!.facebook!.client_id;
            const SECRET_ID = appConfig.getConfig.federations!.facebook!.secret_id;
            const redirectUrl = appConfig.getConfig.federations!.facebook!.callback_url;

            const options = {
                uri: 'https://graph.facebook.com/v7.0/oauth/access_token',
                qs: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    client_id: CLIENT_ID,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    redirect_uri: redirectUrl,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    client_secret: SECRET_ID,
                    code,
                },
            };
            const res: any = await requestPromise.get(options);
            const response = await JSON.parse(res);
            return await Promise.resolve(response.access_token);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async facebookMe(accessToken: string): Promise<SocialUser> {
        try {
            const userFieldSet = 'id,name,email,gender';
            const options = {
                uri: 'https://graph.facebook.com/v7.0/me',
                qs: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    access_token: accessToken,
                    fields: userFieldSet,
                },
            };
            const res: any = await requestPromise.get(options);
            const response = await JSON.parse(res);
            const socialUser: SocialUser = await this.facebookUserDefine(response);
            const isExistNickname = await this.userRepository.isExistNickname(socialUser.nickname);
            if (isExistNickname) {
                socialUser.nickname = socialUser.nickname + '_' + nanoid(5);
            }
            return socialUser;
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async naverGetAccessToken(auth: any): Promise<string> {
        try {
            const CLIENT_ID = appConfig.getConfig.federations!.naver!.client_id;
            const SECRET_ID = appConfig.getConfig.federations!.naver!.secret_id;

            const options = {
                uri: 'https://nid.naver.com/oauth2.0/token',
                qs: {
                    grant_type: 'authorization_code',
                    client_id: CLIENT_ID,
                    client_secret: SECRET_ID,
                    code: auth.code,
                    state: auth.state,
                },
            };
            const res: any = await requestPromise.get(options);
            const response = await JSON.parse(res);
            return await Promise.resolve(response.access_token);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async naverMe(accessToken: string): Promise<SocialUser> {
        try {
            const HEADER = 'Bearer ' + accessToken;
            const options = {
                headers: {Authorization: HEADER},
                uri: 'https://openapi.naver.com/v1/nid/me',
            };
            const res: any = await requestPromise.get(options);
            const response: any = await JSON.parse(res).response;
            const socialUser: SocialUser = await this.naverUserDefine(response);
            const isExistNickname = await this.userRepository.isExistNickname(socialUser.nickname);
            if (isExistNickname) {
                socialUser.nickname = socialUser.nickname + '_' + nanoid(5);
            }
            return socialUser;
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async kakaoGetAccessToken(code: any): Promise<string> {
        try {
            const CLIENT_ID = appConfig.getConfig.federations!.kakao!.client_id;
            const SECRET_ID = appConfig.getConfig.federations!.kakao!.secret_id;
            const redirectUrl = appConfig.getConfig.federations!.kakao!.callback_url;

            const options = {
                uri: 'https://kauth.kakao.com/oauth/token',
                qs: {
                    grant_type: 'authorization_code',
                    client_id: CLIENT_ID,
                    client_secret: SECRET_ID,
                    redirect_uri: redirectUrl,
                    code,
                },
            };
            const res: any = await requestPromise.get(options);
            const response = await JSON.parse(res);
            return response.access_token;
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async kakaoMe(accessToken: string): Promise<SocialUser> {
        try {
            const HEADER = 'Bearer ' + accessToken;
            const options = {
                headers: {
                    Authorization: HEADER,
                },
                uri: 'https://kapi.kakao.com/v2/user/me',
            };
            const res: any = await requestPromise.get(options);
            const response: any = await JSON.parse(res);
            const socialUser: SocialUser = await this.kakaoUserDefine(response);
            const isExistNickname = await this.userRepository.isExistNickname(socialUser.nickname);
            if (isExistNickname) {
                socialUser.nickname = socialUser.nickname + '_' + nanoid(5);
            }
            return socialUser;
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    private facebookUserDefine(userProfile: any): Promise<SocialUser> {
        if (!userProfile.email) {
            throw new Error(
                'facebook에서 email정보를 제공하지 않아 로그인이 불가능합니다.\n' +
                'https://www.facebook.com/settings?tab=account&section=email&view 에서 기본 이메일이 설정되어 있는 지 확인 부탁드립니다.\n'
            );
        }
        const codedGender = userProfile.gender === 'mail' ? 'M' : userProfile.gender === 'femail' ? 'F' : '';
        const facebookUser = new SocialUser();
        facebookUser.email = userProfile.email;
        facebookUser.username = userProfile.name;
        facebookUser.nickname = userProfile.name;
        facebookUser.gender = codedGender;
        facebookUser.providerId = String(userProfile.id);
        facebookUser.type = 'facebook';
        return Promise.resolve(facebookUser);
    }

    private naverUserDefine(userProfile: any): Promise<SocialUser> {
        if (!userProfile.email) {
            throw new Error('네이버에서 email정보를 제공하지 않아 로그인이 불가능합니다.');
        }
        const naverUser = new SocialUser();
        naverUser.email = userProfile.email;
        naverUser.username = userProfile.name;
        naverUser.nickname = userProfile.nickname ? userProfile.nickname : userProfile.name;
        naverUser.gender = userProfile.gender;
        naverUser.picture = userProfile.profile_image;
        naverUser.providerId = String(userProfile.id);
        naverUser.type = 'naver';
        return Promise.resolve(naverUser);
    }

    private kakaoUserDefine(userProfile: any): Promise<SocialUser> {
        if (!userProfile.kakao_account.has_email) {
            throw new Error(
                '카카오 로그인에서 이메일제공에 동의하지 않으시거나 카카오에 이메일계정 연결을 안하신 경우, ' +
                '카카오 로그인을 사용하실 수 없습니다.'
            );
        }
        const kakaoUser = new SocialUser();
        kakaoUser.email = userProfile.kakao_account.email;
        kakaoUser.nickname = userProfile.properties.nickname;
        kakaoUser.gender =
            userProfile.kakao_account.gender === 'male' || userProfile.kakao_account.gender === 'M'
                ? 'M'
                : userProfile.kakao_account.gender === 'female' || userProfile.kakao_account.gender === 'F'
                    ? 'F'
                    : '';
        kakaoUser.picture = userProfile.properties.thumbnail_image;
        kakaoUser.providerId = String(userProfile.id);
        kakaoUser.type = 'kakao';
        return Promise.resolve(kakaoUser);
    }
    */
}

export const socialService = new SocialService(new UserRepository());
