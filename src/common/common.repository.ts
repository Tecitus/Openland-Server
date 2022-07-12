import { runSql } from "./db/database";

export class CommonRepository {

  getLimitToken(uid: string) {
    const query = 'SELECT user_id, exp FROM limit_access_token WHERE uid = ?';
    return runSql(query, uid);
  }

  createLimitToken(param: { uid: string; userId: number; expDate: string | null }) {
    const query = 'INSERT INTO limit_access_token (uid, user_id, exp) VALUES (?, ?, ?);';
    return runSql(query, [param.uid, param.userId, param.expDate]);
  }

  removeLimitToken(uid: string) {
    const query = 'DELETE FROM limit_access_token WHERE uid = ?';
    return Promise.resolve(runSql(query, uid));
  }

  removeLimitTokenByUserId(userId: number) {
    try {
      const query = 'DELETE FROM limit_access_token WHERE user_id = ?';
      return Promise.resolve(runSql(query, userId));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  createLimitNumber(param: { userId: string; fourDigitNumber: number; expDate: string }) {
    const query = 'INSERT INTO limit_access_number (random_number, user_id, exp) ' +
      'VALUES (?, ?, ?);';
    return runSql(query, [param.fourDigitNumber, param.userId, param.expDate]);
  }

  removeLimitNumberByUserId(userId: string) {
    try {
      const query = 'DELETE FROM limit_access_number WHERE user_id = ?';
      return Promise.resolve(runSql(query, userId));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getLimitNumber(userId: string) {
    const query = 'SELECT random_number, exp FROM limit_access_number WHERE user_id = ?';
    return runSql(query, userId);
  }
}

export const commonRepository = new CommonRepository;
