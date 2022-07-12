import { nft } from './nft';
import * as requestPromise from 'request-promise-native';
import { appConfig } from '../app-config';
import { NftRepository } from './nft.repository';
import { nanoid } from 'nanoid/non-secure';
import {UserRepository} from "../user/user.repository";
import {UserService} from "../user/user.service";

export class NftService {
    constructor(private nftRepository: NftRepository) {
    }

    public async facebookGetAccessToken(code: any): Promise<string> {
        try {
            const CLIENT_ID = appConfig.getConfig.federations!.facebook!.client_id;
            const SECRET_ID = appConfig.getConfig.federations!.facebook!.secret_id;
            const redirectUrl = appConfig.getConfig.federations!.facebook!.callback_url;

            const options = {
                uri: 'https://graph.facebook.com/v7.0/oauth/access_token',
                qs: {
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    client_id: CLIENT_ID,
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    redirect_uri: redirectUrl,
                    // eslint-disable-next-line @typescript-eslint/camelcase
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
}

export const nftService = new NftService(new NftRepository());