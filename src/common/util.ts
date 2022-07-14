import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { endOfDay, format } from 'date-fns';
import { appConfig } from '../app-config';

const IV_LENGTH = 16;

export function isPresent(value: any): boolean {
  return !(value === undefined || value === null || value === '' || value === 'NaN');
}

export function isEmptyObject(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

export function isNotEmptyObject(obj: any): boolean {
  return obj === undefined || Object.keys(obj).length !== 0;
}

export function ensureString(value: any): string {
  return typeof value === 'string' ? value : '';
}

export function resultAppend(source1: object, result: boolean, error?: any): object {
  let resultObj = Object.assign({}, source1, { success: result });
  if (error) {
    resultObj = Object.assign({}, resultObj, { message: error.message ? error.message : error });
  }
  return resultObj;
}

export function encrypt(text: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ENCRYPTION_KEY = Buffer.from(appConfig.getConfig.encryptKey, 'base64');
  if (!ENCRYPTION_KEY) {
    throw new Error('encryptKey가 없습니다!');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return Promise.resolve(iv.toString('hex') + ':' + encrypted.toString('hex'));
}

export function decrypt(text: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ENCRYPTION_KEY = Buffer.from(appConfig.getConfig.encryptKey, 'base64');
  if (!ENCRYPTION_KEY) {
    throw new Error('encryptKey가 없습니다!');
  }
  if (text.length === 0) {
    return Promise.resolve(text);
  }
  const textParts = text.split(':');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return Promise.resolve(decrypted.toString());
}

export function formUrlEncoded(object: any): string {
  return Object.entries(object)
    .map(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

export function recMkdirSync(dir: string): void {
  if (fs.existsSync(dir)) {
    return;
  }

  try {
    fs.mkdirSync(dir, 0o775);
  } catch (err) {
    if (err.code === 'ENOENT') {
      recMkdirSync(path.dirname(dir));
      recMkdirSync(dir);
    }
  }
}

function camelToSnake(key: any) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function convertCamelToSnake(original: any): any {
  const newObject: any = {};
  for (const i in original) {
    if (i) {
      newObject[camelToSnake(i)] = original[i];
    }
  }
  return newObject;
}

function snakeToCamel(key: any) {
  return key.replace(/([-_][a-z])/gi, ($1: any) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

export function convertSnakeToCamel(original: any): any {
  if (Array.isArray(original)) {
    const newArray: any = [];
    original.forEach((item) => newArray.push(convertSnakeToCamel(item)));
    return newArray;
  }
  const newObject: any = {};
  for (const i in original) {
    if (Object.prototype.hasOwnProperty.call(original,i)) {
      newObject[snakeToCamel(i)] = original[i];
    }
  }
  return newObject;
}

export async function necessary(data: string | number | string[] | number[]): Promise<any> {
  if (Array.isArray(data)) {
    data.forEach((d: string | number | string[] | number[]) => {
      necessary(d);
    });
  } else {
    if (!isPresent(data)) {
      return Promise.reject('필수값이 없습니다');
    }
  }
  return await Promise.resolve();
}

export function getStringDate(day: Date) {
  return format(day, "yyyy-MM-dd'T'HH:mm:ss");
}

export function endDay(day: Date) {
  return getStringDate(endOfDay(day));
}

export function removeEmoji(targetText: string) {
  return targetText.replace(/[^a-zA-Z0-9 \u3130-\u318F\uAC00-\uD7AF]+/g, '');
}

export function randomString() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function sqlMulitipleRow(data: any[]): any {
  let questionMarks = '';
  const values: any[] = [];
  data.forEach((value, index) => {
    questionMarks += '(';
    Object.keys(value).forEach((x) => {
      questionMarks += '?, ';
      values.push(value[x]);
    });
    questionMarks = questionMarks.substr(0, questionMarks.length - 2);
    questionMarks += '), ';
  });
  questionMarks = questionMarks.substr(0, questionMarks.length - 2);
  return { questionMarks, values };
}

/**
 * 에러 처리를 좀더 쉽게 하기 위해서 한번 감싸준다.
 * es7에 제안된 async await를 사용하여 에러처리시 catch가 되기 편하게 해준 방식이다.
 * http://expressjs.com/ko/advanced/best-practice-performance.html#section-10 을 참고하면 좋다.
 */
export const wrap = (fn: any) => (...args: any[]) => fn(...args).catch(args[2]);
