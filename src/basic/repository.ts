import {runSql, runTransSql} from '../common/db/database';
import {isPresent} from '../common/util';
import {Metamask} from './metamask';
import {userService} from "../user/user.service";
import {socialService} from "../user/social.service";
import {UserController} from "../user/user.controller";
import {Runtime} from "inspector";


export class MetamaskRepository {
    public async checkUserExist(address: string): Promise<any> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, address);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }
}


