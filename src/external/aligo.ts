import * as request from 'request-promise-native';
import { appConfig } from '../app-config';
import { email } from '../common/email/email';
import { addMinutes } from 'date-fns';
import * as winston from 'winston';

export class AligoRest {
  public tokenExpired: Date;
  private apikey: string;
  private userid: string;
  private senderKey: string;
  private token: string;

  constructor() {
    if (appConfig.getConfig?.aligo) {
      this.setConfig(
        appConfig.getConfig.aligo.apikey,
        appConfig.getConfig.aligo.userid,
        appConfig.getConfig.aligo.senderKey
      );
    }
  }

  public getUrl(uri: string[]) {
    const baseUrl = 'https://kakaoapi.aligo.in';
    return [baseUrl].concat(uri).join('/');
  }

  public setConfig(apikey: string, userid: string, senderKey: string) {
    this.apikey = apikey;
    this.userid = userid;
    this.senderKey = senderKey;
  }

  public async getAccessToken() {
    const options = {
      uri: this.getUrl(['akv10/token/create/30/m/']),
      form: {
        apikey: this.apikey,
        userid: this.userid,
      },
    };
    try {
      await request.post(options).then((res: any) => {
        const response = JSON.parse(res);
        if (response.code === 0) {
          this.token = response.token;
          this.tokenExpired = addMinutes(new Date(), 25);
        } else {
          // TODO: 오류 email 전송 : res.body.message
        }

        return Promise.resolve(this.token);
      });
    } catch (err) {
      winston.error('err::' + JSON.stringify(err));
      return Promise.reject(new Error(err));
    }
  }

  public async send(datas: AlimtalkForm[]) {
    if (datas === undefined) {
      throw new Error('데이터가 없습니다');
    }
    await this.tokenCheck();

    const mergeData: any = {};
    const checkDuplication = new Set();

    // TODO :: 500 건이 넘으면 나눠서 보내야 함

    for (let i = 0; i < datas.length; i++) {
      if (checkDuplication.has(datas[i].phone)) {
        continue;
      }
      checkDuplication.add(datas[i].phone);

      const receiverKey = `receiver_${i + 1}`;
      mergeData[receiverKey] = datas[i].phone;
      if (datas[i].userName) {
        const recvnameKey = `recvname_${i + 1}`;
        mergeData[recvnameKey] = datas[i].userName;
      }
      const subjectKey = `subject_${i + 1}`;
      mergeData[subjectKey] = datas[i].title;
      const messageKey = `message_${i + 1}`;
      mergeData[messageKey] = datas[i].message;
      const buttonKey = `button_${i + 1}`;
      mergeData[buttonKey] = datas[i].button;
      const fsubjectKey = `fsubject_${i + 1}`;
      mergeData[fsubjectKey] = datas[i].title;
      if (datas[i].fmessage) {
        const fmessageKey = `fmessage_${i + 1}`;
        mergeData[fmessageKey] = datas[i].fmessage;
      }
    }

    const mergeForm = Object.assign(
      {
        apikey: this.apikey,
        userid: this.userid,
        token: this.token,
        senderkey: this.senderKey,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tpl_code: datas[0].tplCode,
        sender: '010-9725-9398',
        failover: 'Y',
        // 예약발송시간 // senddate: '20190906221100',
        ...(datas[0].time && { senddate: datas[0].time }),
      },
      mergeData
    );

    const options = {
      uri: this.getUrl(['akv10/alimtalk/send/']),
      form: mergeForm,
    };

    try {
      const res = await request.post(options);
      const response = await JSON.parse(res);
      if (response.code !== 0) {
        await email.sendErrorEmail(
          'alamtalk error:: ' +
            JSON.stringify(response.message) +
            '::' +
            JSON.stringify(mergeData) +
            '::' +
            JSON.stringify(datas)
        );
      }
      return await Promise.resolve();
    } catch (err) {
      setTimeout(() => {
        this.send(datas);
      }, 6000);
      await email.sendErrorEmail('aligo error:: ' + JSON.stringify(err));
      throw new Error(err);
    }
  }

  public async availableCount() {
    await this.tokenCheck();
    const options = {
      uri: this.getUrl(['akv10/heartinfo/']),
      form: {
        apikey: this.apikey,
        userid: this.userid,
        token: this.token,
      },
    };
    try {
      const res = await request.post(options);
      const response = await JSON.parse(res);
      if (response.list.ALT_CNT < 1000) {
        await email.sendErrorEmail('알람톡 충전 필요:: (주)알리는사람들 / 우리은행 4795 1040 5181 27');
      }
    } catch (err) {
      await email.sendErrorEmail('aligo availableCount error:: ' + JSON.stringify(err));
      return Promise.reject(new Error(err));
    }
  }

  private async tokenCheck() {
    if (this.token === undefined || !this.token.length || this.tokenExpired < new Date()) {
      if (appConfig.getConfig.aligo) {
        this.setConfig(
          appConfig.getConfig.aligo.apikey,
          appConfig.getConfig.aligo.userid,
          appConfig.getConfig.aligo.senderKey
        );
      }
      await this.getAccessToken();
    }
  }
}

export const aligo = new AligoRest();

export interface AlimtalkForm {
  type: string;
  userName?: string;
  phone: string;
  title: string;
  message: string;
  button?: string;
  fmessage?: string;
  tplCode?: string;
  time?: string;
}
