import { appConfig } from '../app-config';
import * as request from 'request';

// import * as fs from 'fs';

export class InstaService {

    public getCode() {
        return new Promise((resolve, reject) => {
            const CLIENT_ID = appConfig.getConfig.federations!.instagram!.client_id;
            const REDIRECT_URI = appConfig.getConfig.federations!.instagram!.callback_url;
            const api = 'https://api.instagram.com/oauth/authorize/?client_id=' + CLIENT_ID + '&redirect_uri='
                + REDIRECT_URI + '&response_type=code';

            request.get({url: api, followAllRedirects: true}, (err, res, body) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve('38a15bb2d261438ca47371be47967e06');
                }
            });
        });
    }

    public getToken(theCode: string) {
        return new Promise((resolve, reject) => {
            const CLIENT_ID = appConfig.getConfig.federations!.instagram!.client_id;
            const CLIENT_SECRET = appConfig.getConfig.federations!.instagram!.secret_id;
            const AUTHORIZATION_REDIRECT_URI = appConfig.getConfig.federations!.instagram!.callback_url;
            const options = {
                form: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    redirect_uri: AUTHORIZATION_REDIRECT_URI,
                    code: theCode
                }
            };
            request.post('https://api.instagram.com/oauth/access_token', options, (err, res, body) => {
                resolve(JSON.parse(res.body).access_token);
            });
        });
    }

    public getImages(accessToken: string, callback: (result: any) => void) {
        request.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + accessToken,
            (err, res, body) => {
                if (err) {
                    throw err;
                } else {
                    callback(JSON.parse(res.body).data);
                }
            });
    }

}
