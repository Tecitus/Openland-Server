import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as cookieParser from 'cookie-parser';
import {appConfig} from './app-config';
appConfig.config(process.env.NODE_ENV || 'development');
import bodyParser, {BodyParser} from 'body-parser'
import {RedisConfig} from './common/config'
import {database} from './common/db/database';
import {email} from './common/email/email';
import https from 'https';
//import * as multer from 'multer';
//import multer from 'multer';
import {cronjob} from './external/cronjob';
import * as winston from 'winston';
import {routes} from './routes';
import {redis} from './common/db/redis';
import { createClient } from 'redis';
import { wrapper } from './db/migration';
import ws from 'ws';
import {WebSocketService} from './common/websocket.service';
const session = require("express-session");
let RedisStore = require("connect-redis")(session)

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
    public httpsserver: https.Server;

    constructor() {
        //appConfig.config(process.env.NODE_ENV || 'development');
        this.middleware();
        this.dbConnect();
        this.redisConnect();
        this.app.use(
            session({
                store: new RedisStore({ client: redis.redisClient }),
                saveUninitialized: false,
                secret: appConfig.getConfig.redis.secret,
                resave: false,
            })
        )
        this.mailConnect();
        routes(this.app);
        if(appConfig.getConfig.db.migration)
            wrapper();
        this.error();
        cronjob();
    }

    private middleware(): void {

        this.app = express.default();
        this.httpsserver = https.createServer(this.app);
        new WebSocketService(this.httpsserver)
        const corsOption = {
            origin: appConfig.getConfig.server.cors,
            methods: 'GET,PUT,PATCH,POST,OPTIONS',
            preflightContinue: true,
            credentials: true,
        };
        this.app.options('*', cors.default(corsOption));
        this.app.use(cors.default(corsOption));
        //this.app.use(express.json());
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended:true}));
        //this.app.use(express.urlencoded({extended: true}));
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
        /*
        this.app.use((req: express.Request, res: express.Response, next: any) => {
            const err: any = new Error('Error_found: ' + next);
            err.status = 404;
            next(err);
        });*/
        /* 에러 처리 */
        this.app.use((err: any, req: express.Request, res: express.Response, next: any) => {
            err.status = err.status || 500;
            console.error(`error on requst ${req.method} | ${req.url} | ${err.status}`);
            console.error(err.stack || `${err.message}`);
            //err.mesatus(err.status).send(err.message);
            next();
        });
    }
}
