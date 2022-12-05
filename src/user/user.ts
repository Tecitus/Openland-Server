type ProviderType = 'kakao' | 'naver' | 'facebook';

export class User {
  /*
  // tslint:disable:variable-name
  private _id: number;
  private _email: string;
  private _password: string;
  private _nickname: string;
  private _username: string | null;
  private _phone: string;
  private _gender: string;
  private _picture: string;
  private _verification: string;
  private _mkt: string;
  private _term: string;
  private _level: number;
  private _type: ProviderType;
  private _providerId: string;

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  get nickname(): string {
    return this._nickname;
  }

  set nickname(value: string) {
    this._nickname = value;
  }

  get username(): string | null {
    return this._username;
  }

  set username(value: string | null) {
    this._username = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }

  get picture(): string {
    return this._picture;
  }

  set picture(value: string) {
    this._picture = value;
  }

  get gender(): string {
    return this._gender;
  }

  set gender(value: string) {
    this._gender = value;
  }

  get verification(): string {
    return this._verification;
  }

  set verification(value: string) {
    this._verification = value;
  }

  get mkt(): string {
    return this._mkt;
  }

  set mkt(value: string) {
    this._mkt = value;
  }

  get term(): string {
    return this._term;
  }

  set term(value: string) {
    this._term = value;
  }

  get level(): number {
    return this._level;
  }

  set level(value: number) {
    this._level = value;
  }

  get type(): ProviderType {
    return this._type;
  }

  set type(value: ProviderType) {
    this._type = value;
  }

  get providerId(): string {
    return this._providerId;
  }

  set providerId(value: string) {
    this._providerId = value;
  }
}

export class SocialUser {
  // tslint:disable:variable-name
  private _userId: number;
  private _type: ProviderType;
  private _providerId: string;
  private _email: string;
  private _username: string;
  private _nickname: string;
  private _gender: string;
  private _picture: string;

  get userId(): number {
    return this._userId;
  }

  set userId(value: number) {
    this._userId = value;
  }

  get type(): ProviderType {
    return this._type;
  }

  set type(value: ProviderType) {
    this._type = value;
  }

  get providerId(): string {
    return this._providerId;
  }

  set providerId(value: string) {
    this._providerId = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get nickname(): string {
    return this._nickname;
  }

  set nickname(value: string) {
    this._nickname = value;
  }

  get gender(): string {
    return this._gender;
  }

  set gender(value: string) {
    this._gender = value;
  }

  get picture(): string {
    return this._picture;
  }

  set picture(value: string) {
    this._picture = value;
  }
  */
 public id?:number;
 public email?:string;
 public password?:string;
 public salt?:string;
 public nickname?:string;
 public username?:string;
 //public phone:string;
 public picture?:string;
}
/*
export function socialUserToUser(sUser: SocialUser): User {
  const nUser = new User();
  nUser.id = sUser.userId;
  nUser.email = sUser.email;
  nUser.username = sUser.username;
  nUser.nickname = sUser.nickname;
  nUser.gender = sUser.gender;
  nUser.picture = sUser.picture;
  nUser.type = sUser.type;
  nUser.providerId = sUser.providerId;
  return nUser;
}
*/