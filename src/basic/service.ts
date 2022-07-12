import {Metamask} from './metamask';
import * as requestPromise from 'request-promise-native';
import {appConfig} from '../app-config';
import {MetamaskRepository} from './metamaskRepository';
import {nanoid} from 'nanoid/non-secure';
import {UserRepository} from "../user/user.repository";
import {UserService} from "../user/user.service";

export class MetamaskService {
    constructor(private metamaskRepository: MetamaskRepository) {
    }

    public async facebookGetAccessToken(code: any): Promise<string> {
        try {
            return await Promise.resolve(response.access_token);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }
}

export const metamaskService = new MetamaskService(new MetamaskRepository());
