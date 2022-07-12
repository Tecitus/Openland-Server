import * as express from 'express';
import { Server } from './app';
import * as fs from 'fs';
import { email } from './common/email/email';
import * as winston from "winston";

const port: number = Number(process.env.PORT) || 8080;
const app: express.Application = new Server().app;

process.on('uncaughtException', (err) => {
    fs.appendFile('./node_exception_error.log', '\n' + new Date() + '::' + err, () => {
        winston.error('error::' + err);
    });
});

app.listen(port, () => {
    winston.info('Express server listening on port ::' + port);
}).on('error', (err: any) => {
    email.sendMail(
        'sundaynamaste<noreply@sundaynamaste.com>',
        'jinbju@gmail.com',
        '[sundaynamaste] node error',
        'error',
        {
            url: 'https://www.sundaynamaste.com',
            text: err
        }
    );
    console.error('uncatched error ::' + err);
});
