import * as request from 'request-promise-native';
import { appConfig } from '../app-config';
import { formUrlEncoded } from '../common/util';
import { email } from '../common/email/email';

export class Kakaopay {
  adminKey: string;
  cid: string;

  public setConfig(adminKey: string, cid: string) {
    this.adminKey = adminKey;
    this.cid = cid;
  }

  async ready(classInfo: any, orderId: number, userId: number, price: number, giftId?: string) {
    this.init();
    let hostString = '';
    if (process.env.NODE_ENV === 'production') {
      hostString = 'https://www.sundaynamaste.com';
    } else {
      hostString = 'http://localhost:4200';
    }
    let giftParam = '';
    if (giftId && giftId.length > 0) {
      giftParam = '&giftId=' + giftId;
    }
    const options = {
      uri: this.getKakaopayUrl(['/v1/payment/ready']),
      body: formUrlEncoded({
        cid: this.cid,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        partner_order_id: orderId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        partner_user_id: userId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        item_name: classInfo.name,
        quantity: 1,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        total_amount: price,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tax_free_amount: 0,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        approval_url: hostString + '/payment/kakaopayready?orderId=' + orderId + giftParam,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        cancel_url: hostString + `/class/${classInfo.id}/apply/${classInfo.optionId}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        fail_url: hostString + `/class/${classInfo.id}/apply/${classInfo.optionId}?kakaopay=fail`,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8',
        Authorization: `KakaoAK ${this.adminKey}`,
      },
    };
    try {
      const response = await request.post(options);
      const res = await JSON.parse(response);
      return Promise.resolve(res);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  async approve(orderInfo: any, pgToken: string): Promise<any> {
    this.init();
    const options = {
      uri: this.getKakaopayUrl(['/v1/payment/approve']),
      body: formUrlEncoded({
        cid: this.cid,
        tid: orderInfo.kakaopayTid,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        partner_order_id: orderInfo.orderId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        partner_user_id: orderInfo.userId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pg_token: pgToken,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8',
        Authorization: `KakaoAK ${this.adminKey}`,
      },
      simple: false, // 400 경우에도 error 아닌 것으로 처리해줌
    };
    try {
      const res = await request.post(options);
      const result = JSON.parse(res);
      if (result.aid) {
        return Promise.resolve(result);
      } else {
        await email.sendErrorEmail('카카오페이 결제에러1:: ' + result.msg + '::' + result.extras.method_result_message);
        throw new Error(result.extras.method_result_message);
      }
    } catch (err) {
      await email.sendErrorEmail('카카오페이 결제:: ' + JSON.stringify(err));
      throw err;
    }
  }

  async cancel(kakaopayTid: string, price: number) {
    this.init();
    const options = {
      uri: this.getKakaopayUrl(['/v1/payment/cancel']),
      body: formUrlEncoded({
        cid: this.cid,
        tid: kakaopayTid,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        cancel_amount: price,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        cancel_tax_free_amount: 0,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8',
        Authorization: `KakaoAK ${this.adminKey}`,
      },
    };
    try {
      const res = await request.post(options);
      const result = JSON.parse(res);
      if (result.aid) {
        return Promise.resolve();
      } else {
        throw new Error(result.msg + '::' + result.extras.method_result_message);
      }
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  private init() {
    if (appConfig.getConfig.kakaopay && !this.adminKey) {
      this.setConfig(appConfig.getConfig.kakaopay.adminKey, appConfig.getConfig.kakaopay.cid);
    }
  }

  private getKakaopayUrl(uri: string[]) {
    const baseUrl = 'https://kapi.kakao.com';
    return [baseUrl].concat(uri).join('/');
  }
}

export const kakaoPay = new Kakaopay();
