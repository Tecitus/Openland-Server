import * as express from 'express';
import { Server } from './app';
import * as fs from 'fs';
import * as winston from "winston";

const port: number = Number(process.env.PORT) || 8080;
const host: string = process.env.HOST || 'localhost'
const app: Server = new Server();
const httpsserver = app.httpserver;

process.on('uncaughtException', (err) => {
    fs.appendFile('./node_exception_error.log', '\n' + new Date() + '::' + err, () => {
        winston.error('error::' + err);
    });
});

httpsserver.listen(port,host, () => {
    winston.info('Express server listening on port ::' + port);
}).on('error', (err: any) => {
    console.error('uncatched error ::' + err);
});
