export interface Config {
  version?: string;
  db?: DbConfig;
  web3? : Web3Config;
  redis?: RedisConfig;
  apiUrl?: string;
  encryptKey?: string;
  env?: string;
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
  migrationdata?:string;
  assetnum?:number;
  collectionnum?:number;
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
  gaslimit?:number;
}