import { Response } from 'express';
import { appConfig } from '../app-config';

export function json(res: Response, obj: any, statusCode = 200) {
  const newObj = { ...obj, ...{ version: appConfig.getConfig.version } };
  res.status(statusCode);
  res.json(newObj);
}
