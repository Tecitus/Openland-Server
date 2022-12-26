import {db} from '../db/knex'
import { User } from './user';

export class UserRepository {

  //유저 생성
  public async createUser(user:User): Promise<User>
  {
    try{
      const result = await db.db('Users').insert<User>(user);
      const realuser = await db.db('Users').select('*').where({id: result[0]});
      console.log(realuser);
      return realuser[0];
    }
    catch(err)
    {
      console.log(err);
      return null;
    }
  }

  //DB 상의 id에 해당하는 유저 데이터 반환
  public async getUserData(userid:number) : Promise<User>
  {
    try{
      const result = await db.db('Users')
      .select('*')
      .where({id: userid})
      .first();
      return result;
    }
    catch(err)
    {
      console.log(err);
      return null;
    }
  }

  //조건을 만족하는 유저 데이터 반환
  public async findUserData(obj:any) : Promise<User[]>
  {
    try{
      const result = await db.db('Users').select('*').where(obj);
      return result;
    }
    catch(err)
    {
        console.log(err)
      return null;
    }
  }


  public async updateUserData(user:User) : Promise<boolean>
  {
    try{
      const result = await db.db('Users').update(user).where({id:user.id});
      return true;
    }
    catch(err)
    {
      return null;
    }
  }
}
