import { Request, RequestHandler, Response } from 'express';
import { InstaService } from './insta.service';
import { json } from '../common/controller';

export class InstaController {

    constructor(private service: InstaService) {
    }

    public getImages(): RequestHandler {
        return (req: Request, res: Response) => {
            const theToken = '5998524533.a33daab.da9bcaa8bfe045ee88d3f0eec000ec50';
            this.service.getImages(theToken, (result) => {
                return json(res, result);
            });
        };
    }

    public getToken(): RequestHandler {
        return (req: Request, res: Response) => {
            const theToken = '5998524533.a33daab.da9bcaa8bfe045ee88d3f0eec000ec50';
            return json(res, {token: theToken});

            // this.instaService.getCode()
            //     .then((theCode: string) => {
            //         return this.instaService.getToken(theCode);
            //     })
            //     .then((theToken: string) => {
            //     return json(res, {token: theToken});
            // });
            // {token: '2078645503.c998047.7ae324f8d28f47bb9b24ec1834efce3e'}
        };
    }

    // public getToken(): RequestHandler {
    //     return (req: Request, res: Response) => {
    //         this.instaService.getToken(req.query);
    //         console.log(req.query);
    //     };
    // }
}
