import { runSql, runTransSql } from '../common/db/database';
import { isPresent } from '../common/util';
import { nft } from './nft';
import {userService} from "../user/user.service";
import {socialService} from "../user/social.service";
import {UserController} from "../user/user.controller";
import {NftController} from "./nft.controller";

export class NftRepository {
    public async getCourseTeacherListByUserId(id: any): Promise<any> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, id);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }
}


