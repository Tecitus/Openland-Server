import knex from 'knex';
import {Knex} from 'knex';
import { DbConfig } from '../common/config';
import {appConfig} from '../app-config'
import {wrapper} from './tables'

export class Database
{
    public db : Knex;
    constructor(dbConfig: DbConfig)
    {
        this.db = knex({
            client: 'mysql2',
            connection: {
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                database: dbConfig.database,
                password: dbConfig.password,
            }
        });

        wrapper(this.db); //테이블 선언
    }
}

export const db = new Database(appConfig.getConfig.db);