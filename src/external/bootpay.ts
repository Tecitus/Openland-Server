// https://github.com/bootpay/server_nodejs/blob/master/lib/bootpay.js
import * as request from 'request-promise-native';
import { appConfig } from '../app-config';
import { email } from '../common/email/email';
import { addMinutes, fromUnixTime } from 'date-fns';

export class BootpayRest {
  public tokenExpired: Date;
  private applicationId: string;
  private privateKey: string;
  private token: string;

  constructor() {
    // if (appConfig.getConfig.bootpay) {
    //   this.setConfig(appConfig.getConfig.bootpay.applicationId, appConfig.getConfig.bootpay.privateKey);
    // }
  }

  public getUrl(uri: string[]) {
    const baseUrl = 'https://api.bootpay.co.kr';
    return [baseUrl].concat(uri).join('/');
  }

  public setConfig(applicationId: string, privateKey: string) {
    this.applicationId = applicationId;
    this.privateKey = privateKey;
  }

  public async getAccessToken() {
    if (appConfig.getConfig.bootpay) {
      this.setConfig(appConfig.getConfig.bootpay.applicationId, appConfig.getConfig.bootpay.privateKey);
    }
    const options = {
      uri: this.getUrl(['request', 'token']),
      body: {
        application_id: this.applicationId,
        private_key: this.privateKey,
      },
      json: true,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    };
    try {
      const res = await request.post(options);
      if (res.status === 200) {
        this.token = res.data.token;
        this.tokenExpired = addMinutes(fromUnixTime(res.data.expired_at), -5);
        return Promise.resolve(this.token);
      }
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  public async verify(receiptId: string) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }
    if (receiptId === undefined) {
      throw new Error('receiptId 값을 입력해주세요.');
    }
    if (this.token === undefined || !this.token.length) {
      throw new Error('Access Token을 발급 받은 후 진행해주세요.');
    }

    const options = {
      uri: this.getUrl(['receipt', receiptId]),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      json: true,
    };
    try {
      const res = await request(options);
      return await res.data;
    } catch (err) {
      await email.sendErrorEmail('bootpay verify error:: ' + JSON.stringify(err));
      return Promise.reject(new Error(err));
    }
  }

  public async submit(receiptId: string) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }
    const res = await request.post(this.getUrl(['submit']), {
      body: {
        receipt_id: receiptId,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      json: true,
    });
    if (res.status === 200) {
      return await Promise.resolve(res.data);
    }
  }

  public async cancel(receiptId: string, name?: string, reason?: string, price?: number) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }

    const options = {
      body: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        receipt_id: receiptId,
        name: name,
        reason: reason,
        price: price ? price : undefined,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      json: true,
    };
    const res = await request.post(this.getUrl(['cancel.json']), options);
    if (res.status === 200) {
      return await Promise.resolve(res.data);
    } else {
      await email.sendErrorEmail('bootpay취소에러::' + JSON.stringify(res));
      throw new Error('취소에러from모듈');
    }
  }

  public async subscribeBilling(
    billingKey: string,
    itemName: string,
    price: string,
    orderId: string,
    items = [],
    userInfo: any
  ) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }
    const res = await request.post(this.getUrl(['subscribe', 'billing.json']), {
      body: {
        billing_key: billingKey,
        item_name: itemName,
        price,
        order_id: orderId,
        items,
        username: userInfo.username,
        phone: userInfo.phone,
        address: userInfo.address,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      json: true,
    });
    if (res.status === 200) {
      return await Promise.resolve(res.data);
    } else {
      return await Promise.reject(res);
    }
  }

  public async subscribeBillingReserve(
    billingKey: string,
    itemName: string,
    price: string,
    orderId: string,
    executeAt: string,
    feedbackUrl: string,
    items = []
  ) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }
    const res = await request.post(this.getUrl(['subscribe', 'billing', 'reserve']), {
      body: {
        billing_key: billingKey,
        item_name: itemName,
        price,
        order_id: orderId,
        items,
        scheduler_type: 'oneshot',
        execute_at: executeAt,
        feedback_url: feedbackUrl,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      json: true,
    });
    if (res.status === 200) {
      return await Promise.resolve(res.data);
    } else {
      return await Promise.reject(res);
    }
  }

  public async getSubscribeBillingKey(data: any) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }
    const res = await request.post(this.getUrl(['request', 'card_rebill']), {
      body: {
        order_id: data.orderId,
        pg: data.pg,
        item_name: data.name,
        card_no: data.cardNo,
        card_pw: data.cardPw,
        expire_year: data.expireYear,
        expire_month: data.expireMonth,
        identify_number: data.identifyNumber,
        user_info: data.userInfo,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8"',
        Authorization: this.token,
      },
      json: true,
    });
    if (res.status === 200) {
      return await Promise.resolve(res.data);
    } else {
      return await Promise.reject(res);
    }
  }

  public async destroySubscribeBillingKey(billingKey: string) {
    if (this.tokenExpired === undefined || this.tokenExpired <= new Date()) {
      await this.getAccessToken();
    }
    const res = await request.del(this.getUrl(['subscribe', 'billing', billingKey]), {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8"',
        Authorization: this.token,
      },
      json: true,
    });
    if (res.status === 200) {
      return await Promise.resolve(res.data);
    } else {
      return await Promise.reject(res);
    }
  }
}

export const bootPay = new BootpayRest();
