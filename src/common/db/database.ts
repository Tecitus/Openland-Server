import * as mysql from 'mysql2/promise';
import { Pool, PoolConnection } from 'mysql2/promise';
import { DbConfig } from '../config';
import { email } from '../email/email';
import * as winston from 'winston';

class Database {
  private dbPool: Pool;

  public get connectedPool() {
    return this.dbPool;
  }

  public async connectionPool(dbConfig: DbConfig): Promise<any> {
    const connectionConfig: any = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password,
      connectionLimit: 20,
    };
    try {
      const pool: Pool = mysql.createPool(connectionConfig);
      const connection: PoolConnection = await pool.getConnection();
      this.dbPool = pool;
      connection.release();
      return await Promise.resolve();
    } catch (err) {
      winston.error('db connection error!');
      return await Promise.reject();
    }
  }

  public async runSql(connection: PoolConnection, query: string, values?: any): Promise<any> {
    if (values) {
      try {//$
        const [results]: any = await connection.query(query, values);
        return await Promise.resolve(results);
      } catch (err) {
        let newError;
        if (
          err.message.startsWith('Duplicate entry') &&
          (query.startsWith('UPDATE users SET') || query.startsWith('INSERT INTO users SET'))
        ) {
          newError = new Error('다른 분이 이미 사용중입니다. 다른 닉네임으로 변경해주세요!');
        } else {
          await email.sendErrorEmail(query + '||' + JSON.stringify(values) + '||' + err);
          newError = new Error('DB오류 입니다. 상담을 통해 문의 부탁드립니다.');
        }
        return Promise.reject(newError);
      }
    } else {
      try {
        const [results]: any = await connection.query(query);
        return await Promise.resolve(results);
      } catch (err) {
        await email.sendErrorEmail(query + '||' + err);
        const newError = new Error('DB오류 입니다. 상담을 통해 문의 부탁드립니다.');
        return Promise.reject(newError);
      }
    }
  }
}

export const database = new Database();

export async function startTransaction() {
  const pool: Pool = database.connectedPool;
  try {
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      return connection;
    } catch (err) {
      await connection.rollback();
      connection.release();
      return await Promise.reject(err);
    }
  } catch (err) {
    return await Promise.reject();
  }
}

export async function commitConn(conn: PoolConnection) {
  try {
    await conn.commit();
    conn.release();
  } catch (err) {
    await conn.rollback();
    conn.release();
  }
}

export async function runTransSql(connection: PoolConnection, query: string, values?: any) {
  return await database.runSql(connection, query, values);
}

export async function runSql(query: string, values?: any) {
  const pool: Pool = database.connectedPool;
  const connection: PoolConnection = await pool.getConnection();
  try {
    const result = await database.runSql(connection, query, values);
    connection.release();
    return await result;
  } catch (err) {
    await connection.rollback();
    connection.release();
    return Promise.reject(new Error(err));
  }
}
