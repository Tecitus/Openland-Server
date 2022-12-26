import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as cookieParser from 'cookie-parser';
import {appConfig} from './app-config';
appConfig.config(process.env.NODE_ENV || 'development');
import {db} from "./db/knex"
import bodyParser, {BodyParser} from 'body-parser'
import {RedisConfig} from './common/config'
import https from 'https';
import http from 'http';
import * as winston from 'winston';
import {routes} from './routes';
import {redis} from './common/db/redis';
import { createClient } from 'redis';
import { wrapper } from './db/migration';
import ws from 'ws';
const session = require("express-session");
let RedisStore = require("connect-redis")(session)

export class Server {
    public app: express.Application;
    public httpserver: https.Server | http.Server;

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
        routes(this.app);
        this.error();
    }

    private async middleware(){

        this.app = express.default();
        db.CreateTables().then(()=>{
            if(appConfig.getConfig.db.migration)
                wrapper();
        });
        this.httpserver = http.createServer(this.app);
        const corsOption = {
            origin: appConfig.getConfig.server.cors,
            methods: 'GET,PUT,PATCH,POST,OPTIONS',
            preflightContinue: true,
            credentials: true,
        };
        this.app.options('*', cors.default(corsOption));
        this.app.use(cors.default(corsOption));
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended:true}));
        this.app.use(cookieParser.default());
        this.app.use(helmet.default());
        this.app.use(hpp.default());
    }

    private dbConnect(): void {
        if (appConfig.getConfig.db) {
                undefined;
        } else {
            winston.error('Db config is not set');
        }
    }

    private redisConnect() {
        if (appConfig.getConfig.redis) {
            redis.connection(appConfig.getConfig.redis);
        }
    }

    private error(): void {
        /* 에러 처리 */
        this.app.use((err: any, req: express.Request, res: express.Response, next: any) => {
            err.status = err.status || 500;
            console.error(`error on requst ${req.method} | ${req.url} | ${err.status}`);
            console.error(err.stack || `${err.message}`);
            next();
        });
    }
}
