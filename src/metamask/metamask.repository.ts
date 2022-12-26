
import {Metamask} from './metamask';
import {userService} from "../user/user.service";
import {UserController} from "../user/user.controller";
import {Runtime} from "inspector";
import {db} from "../db/knex"



export class MetamaskRepository {

    // TODO :  응 sql 죄다 고쳐~
    /*
    public async checkUserExist(address: string): Promise<any> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, address);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }

    public async userCreate(cred: any): Promise<any> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, [cred]);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }

    public async userLogin(address: string, loginDt: string): Promise<any> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, [address, loginDt]);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }*/


    // public async getCourseTeacherListByUserId(id: any): Promise<any> {
    //     try {
    //         const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
    //         const result: any = await runSql(query, id);
    //         return await Promise.resolve(result);
    //     } catch (err) {
    //         return Promise.reject(new Error(err));
    //     }
    // }

    public async createMetamaskData(metamask : Metamask): Promise<Metamask>
    {
        try
        {
            return await db.db('Metamasks').insert(metamask);
        }
        catch(err)
        {
            return null;
        }
    }

    public async getMetamaskData(metamaskaddress : string): Promise<Metamask>
    {
        try
        {
            return await db.db.from('Metamasks').select('*').where({address: metamaskaddress}).first();
        }
        catch(err)
        {
            console.log(err);
            return null;
        }
    }

    public async getMetamaskDataByUserId(userid : number) : Promise<Metamask[]>
    {
        try{
            return await db.db.select().from('Metamasks').where({userid: userid});
        }
        catch(err)
        {
            return null;
        }
    }
}


