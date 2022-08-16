import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as cookieParser from 'cookie-parser';
import {appConfig} from './app-config';
import {database} from './common/db/database';
import {email} from './common/email/email';
//import * as multer from 'multer';
//import multer from 'multer';
import {cronjob} from './external/cronjob';
import * as winston from 'winston';
import {routes} from './routes';
import {redis} from './common/db/redis';

/*
const fileStorage = multer.diskStorage({
    destination: (req, nfile, cb) => {
        cb(null, '/home/public/collection_temp');
    },
    filename: (req, nfile, cb) => {
        cb(null, nfile.originalname);
    },
});

export const uploadConfig = multer({
    storage: fileStorage,
});
*/
export class Server {
    public app: express.Application;

    constructor() {
        appConfig.config(process.env.NODE_ENV || 'development');
        this.middleware();
        this.dbConnect();
        this.redisConnect();
        this.mailConnect();
        routes(this.app);
        this.error();
        cronjob();
    }

    private middleware(): void {
        this.app = express.default();
        const corsOption = {
            origin: [
                'https://www.sundaynamaste.com',
                'https://crew.sundaynamaste.com',
                'https://graph.facebook.com',
                'https://nid.naver.com',
                'https://openapi.naver.com',
                'https://kapi.kakao.com',
                'https://223.130.82.4',
                'https://kakaoapi.aligo.in',
            ],
            methods: 'GET,PUT,PATCH,POST,OPTIONS',
        };
        this.app.use(cors.default(corsOption));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(cookieParser.default());
        this.app.use(helmet.default());
        this.app.use(hpp.default());
    }

    private dbConnect(): void {
        if (appConfig.getConfig.db) {
            database
                .connectionPool(appConfig.getConfig.db)
                .then(() => {
                    // console.log('Db Connection Resolved');
                })
                .catch((err) => {
                    winston.error('Db Connection Rejected ::' + err);
                });
        } else {
            winston.error('Db config is not set');
        }
    }

    private redisConnect() {
        if (appConfig.getConfig.redis) {
            redis.connection(appConfig.getConfig.redis);
        }
    }

    private mailConnect(): void {
        if (appConfig.getConfig.mail && process.env.NODE_ENV === 'production') {
            email
                .connection(appConfig.getConfig.mail)
                .then(() => {
                    // console.log('EMail Connection Resolved');
                })
                .catch((err) => {
                    winston.error('EMail Connection Rejected ::' + err);
                });
        } else {
            winston.error('EMail config is not set');
        }
    }

    private error(): void {
        this.app.use((req: express.Request, res: express.Response, next: any) => {
            const err: any = new Error('Error_found: ' + next);
            err.status = 404;
            next(err);
        });
        /* 에러 처리 */
        this.app.use((err: any, req: express.Request, res: express.Response) => {
            err.status = err.status || 500;
            console.error(`error on requst ${req.method} | ${req.url} | ${err.status}`);
            console.error(err.stack || `${err.message}`);
            err.mesatus(err.status).send(err.message);
        });
    }
}
