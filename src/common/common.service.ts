import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {CommonRepository} from './common.repository';
import {getStringDate} from './util';

const LIMIT_MINUTE = 5;

class CommonService {
  constructor(private commonRepository: CommonRepository) {
  }


  public async createPasswordResetUrl(findUser: User): Promise<any> {
    try {
      const uid = nanoid();
      await this.insertLimitToken(uid, findUser.id, LIMIT_MINUTE);
      const url = 'https://www.sundaynamaste.com/resetpassword?uid=' + uid;
      return await Promise.resolve(url);
    } catch (err) {
      return await Promise.reject(err);
    }
  }

  public async createEmailVerificationUrl(findUser: User): Promise<any> {
    try {
      const uid = nanoid();
      await this.insertLimitToken(uid, findUser.id, undefined);
      const url = 'https://www.sundaynamaste.com/verification?uid=' + uid;
      return Promise.resolve(url);
    } catch (err) {
      return await Promise.reject(err);
    }
  }

  public async checkUid(uid: string): Promise<string> {
    try {
      const result: any = await this.commonRepository.getLimitToken(uid);
      if (result.length > 0) {
        if (result[0].exp && result[0].exp < new Date()) {
          throw new Error('허용시간이 초과하였습니다!');
        } else {
          return result[0].user_id;
        }
      } else {
        throw new Error('이미 처리되었습니다!');
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public deleteUid(uid: string) {
    try {
      return this.commonRepository.removeLimitToken(uid);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async deleteUidByUserId(userId: number) {
    try {
      return this.commonRepository.removeLimitTokenByUserId(userId);
    } catch (err) {
      return await Promise.reject(err);
    }
  }

  async createRandomNumber(userId: string): Promise<number> {
    try {
      const fourDigitNumber: number = Math.floor(1000 + Math.random() * 9000);
      const myDate = new Date();
      const min = myDate.getMinutes();
      myDate.setMinutes(min + LIMIT_MINUTE);
      const expDate = getStringDate(myDate);
      await this.commonRepository.removeLimitNumberByUserId(userId);
      await this.commonRepository.createLimitNumber({userId, fourDigitNumber, expDate});
      return Promise.resolve(fourDigitNumber);
    } catch (err) {
      return await Promise.reject(err);
    }
  }

  async checkLimitNumber(userId: string, theNumber: number) {
    try {
      const now = new Date();
      const result: any = await this.commonRepository.getLimitNumber(userId);
      if (result.length > 0) {
        if (result[0].random_number === theNumber && result[0].exp > now) {
          await this.commonRepository.removeLimitNumberByUserId(userId);
          return true;
        } else if (result[0].exp && result[0].exp < now) {
          throw new Error('허용시간이 초과하였습니다!');
        } else {
          throw new Error('인증번호가 맞지 않습니다!');
        }
      } else {
        throw new Error('인증번호가 맞지 않습니다!');
      }
    } catch (err) {
      return await Promise.reject(err);
    }
  }

  private async insertLimitToken(uid: string, userId: number, limitMinute?: number) {
    try {
      let expDate = null;
      if (limitMinute) {
        const myDate = new Date();
        const min = myDate.getMinutes();
        myDate.setMinutes(min + limitMinute);
        expDate = getStringDate(myDate);
      }
      const result = await this.commonRepository.createLimitToken({uid, userId, expDate});
      return Promise.resolve(result);
    } catch (err) {
      return await Promise.reject(err);
    }
  }
}

export const commonService = new CommonService(new CommonRepository());
