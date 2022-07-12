import { Config } from './common/config';

class AppConfig {
  private appConf: Config;

  public config(configName: string) {
    this.appConf = require(`./config/${configName}.json`);
  }

  public get getConfig(): Config {
    return this.appConf;
  }
}

export const appConfig = new AppConfig();
