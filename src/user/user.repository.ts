import { runSql, runTransSql } from '../common/db/database';
import { isPresent } from '../common/util';
import { SocialUser, User } from './user';

export class UserRepository {
  public async getCourseTeacherListByUserId(id: any): Promise<any> {
    try {
      const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
      const result: any = await runSql(query, id);
      return await Promise.resolve(result);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async getCourseTeacherByClassId(classId: number): Promise<any> {
    try {
      const query =
        'SELECT u.email, u.username ' +
        'FROM users u, teacher t, class c ' +
        'WHERE c.id = ? ' +
        'AND c.course_keyword = t.keyword ' +
        'AND t.user_id = u.id;';
      const result: any = await runSql(query, classId);
      return await Promise.resolve(result[0]);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async getCourseList(): Promise<any> {
    try {
      const result: any = await runSql('SELECT keyword, name FROM teacher ;');
      if (isPresent(result)) {
        return await Promise.resolve(result);
      } else {
        return Promise.reject(new Error('courseList 오류.'));
      }
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async insertUser(cred: any): Promise<number> {
    try {
      const result = await runSql('INSERT INTO users SET ?;', [cred]);
      return result.insertId;
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async updateUser(userId: number, cred: any, conn?: any) {
    if (conn) {
      return await runTransSql(conn, 'UPDATE users SET ? WHERE id = ?', [cred, userId]);
    } else {
      return await runSql('UPDATE users SET ? WHERE id = ?', [cred, userId]);
    }
  }

  async insertUserProvider(cred: any) {
    return await runSql('INSERT iNTO user_provider SET ?', [cred]);
  }

  public socialUpdateForMkt(userId: number, mkt: string): Promise<any> {
    return runSql('UPDATE users SET term = "Y", mkt = ? WHERE id = ?;', [mkt, userId]);
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = ?;';
      const result: User[] = await runSql(query, email);
      if (isPresent(result) && isPresent(result[0])) {
        return Promise.resolve(result[0]);
      } else {
        return Promise.resolve(null);
      }
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async findById(id: number): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = ?;';
      const result: User[] = await runSql(query, id);
      if (isPresent(result) && isPresent(result[0])) {
        return Promise.resolve(result[0]);
      } else {
        return Promise.resolve(null);
      }
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async findBySocialId(socialUser: SocialUser): Promise<User | null> {
    try {
      const query =
        'SELECT u.id, u.email, u.username, u.nickname, u.phone, u.gender, u.verification, u.picture, u.term, u.mkt, up.type, up.providerId ' +
        'FROM user_provider up ' +
        'JOIN users u ON up.userId = u.id ' +
        'WHERE up.providerId = ? ' +
        'AND up.type = ? ' +
        ';';
      const result: User[] = await runSql(query, [socialUser.providerId, socialUser.type]);
      if (isPresent(result) && isPresent(result[0])) {
        return Promise.resolve(result[0]);
      } else {
        return Promise.resolve(null);
      }
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  setLastLogin(userId: number): Promise<void> {
    try {
      return runSql(
        'INSERT INTO user_status (userId, lastLogin) ' +
          'VALUES (?, now()) ' +
          'ON DUPLICATE KEY UPDATE lastLogin = now();',
        [userId, userId]
      );
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  async isExistNickname(nickname: string): Promise<boolean> {
    try {
      const result: any = await runSql('SELECT 1 FROM users WHERE nickname = ?;', [nickname]);
      if (isPresent(result) && result.length === 1) {
        return await Promise.resolve(true);
      } else {
        return await Promise.resolve(false);
      }
    } catch (err) {
      return await Promise.reject(new Error(err));
    }
  }
}
