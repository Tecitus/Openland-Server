import {nanoid} from 'nanoid';
import {User} from '../user/user';
import {runSql} from "../common/db/database";

const LIMIT_MINUTE = 5;

export class AssetRepository {
    public async getAssetInfo(id: number): Promise<string> {
        try {
            const query = 'SELECT keyword as courseKeyword, level FROM teacher WHERE user_id = ? AND level <> 9;';
            const result: any = await runSql(query, id);
            return await Promise.resolve(result);
        } catch (err) {
            return Promise.reject(new Error(err));
        }
    }
}

export const assetRepository = new AssetRepository();