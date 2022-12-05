export interface Config {
  version?: string;
  db?: DbConfig;
  web3? : Web3Config;
  redis?: RedisConfig;
  mail?: MailConfig;
  apiUrl?: string;
  jwt: JwtConfig;
  encryptKey?: string;
  env?: string;
  federations?: Federation;
  bootpay?: Bootpay;
  kakaopay?: Kakaopay;
  aligo?: Aligo;
  ipfs?: IPFSConfig;
  server?: ServerConfig;
}

export interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  migration?:boolean;
}

export interface ServerConfig {
  cors?: string[];
}

export interface RedisConfig {
  host?: string;
  port?: number;
  secret? : string;
  database? : string;
}

export interface IPFSConfig{
  endpoint? : string;
  projectid? : string;
  projectsecret? : string;
}

export interface Web3Config
{
  url?:string;
  address?:string;
  privatekey?:string;
}

export class JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
}

export interface MailConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
}

export interface Federation {//$
  naver?: FederationItem;
  kakao?: FederationItem;
  facebook?: FederationItem;
  instagram?: FederationItem;
}

export interface FederationItem {
  client_id?: string;
  secret_id?: string;
  callback_url?: string;
}

export interface Bootpay {
  applicationId: string;
  privateKey: string;
}

export interface Kakaopay {
  adminKey: string;
  cid: string;
}

export interface Aligo {
  apikey: string;
  userid: string;
  senderKey: string;
}
