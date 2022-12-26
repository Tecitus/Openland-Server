
import {User} from './user';
import {appConfig} from '../app-config';
import {sha3Hash} from '../common/util';
import {UserRepository} from './user.repository';
import {assetRepository} from '../asset/asset.repository'
import {assetService} from '../asset/asset.service'

import {nanoid} from 'nanoid/non-secure';

export class UserService {
    constructor(private userRepository: UserRepository) {
    }

    public async createNewUser(obj:any)
    {
        const user = obj as User;
        user.salt = nanoid(64);
        user.password = sha3Hash(user.password + user.salt);
        return await this.userRepository.createUser(user);
    }

    public async getUserData(id:number)
    {
        return await this.userRepository.getUserData(id);
    }

    public async findUserData(obj:any)
    {
        return await this.userRepository.findUserData(obj);
    }

    //유저 데이터 변경, obj에 id 는 반드시 들어있어야함
    public async updateUserData(obj:any)
    {
        return await this.userRepository.updateUserData(obj as User);
    }

    public authPassword(password:string, user:User) : boolean
    {
        const hashpassword = sha3Hash(password + user.salt);
        if (hashpassword == user.password)
        return true;
        else return false;
    }

    public async getProfileData(userid:number)
    {
        const collected = (await assetRepository.getCollectedAssets(userid)).length;
        const favorited = (await assetRepository.getFavoritesByUserId(userid)).length;
        return {collected: collected, favoritedcount: favorited};
    }
}

export const userService = new UserService(new UserRepository());
