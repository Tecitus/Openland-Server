import {Metamask} from './metamask';
import * as requestPromise from 'request-promise-native';
import {appConfig} from '../app-config';
import {MetamaskRepository} from './metamaskRepository';
import {nanoid} from 'nanoid/non-secure';
import {UserRepository} from "../user/user.repository";
import {UserService} from "../user/user.service";
import {web3} from "../solidity/Web3Service";

export class MetamaskService {
    constructor(private metamaskRepository: MetamaskRepository) {
    }

    // TODO : checkUserExit
    public async checkUserExist(address: string): Promise<string> {
        try {
            return await this.metamaskRepository.checkUserExist(address);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async userCreate(metamask: Metamask): Promise<string> {
        try {
            const cred = Object.assign({},
                {address: metamask.address},
                {balance: this.getBalance(metamask)},
                {nonce: Math.floor(Math.random() * 1000000)});
            return await this.metamaskRepository.userCreate(cred);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async userLogin(address: string): Promise<number> {
        try {
            return await this.metamaskRepository.userLogin(address, new Date().toISOString());
            //FIXME : check 후 자동으로 updateAt 업뎃해주는 기능 몽고디비 찾으면 lastLogin 지우기
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async deleteUser(metamask: Metamask): Promise<string> {
        try {
            //TODO : 지갑주소를 삭제 ㄴㄴ metamask 서버에 있는지 확인
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }


    //지갑의 보유 코인 확인
    public async getBalance(metamask: Metamask): Promise<string>
    {
        try {
            const wei = await web3.eth.getBalance(metamask.address);//wei 단위로 반환
            return web3.utils.fromWei(wei) // wei를 eth 단위로 변환하는 함수
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }
}

export const metamaskService = new MetamaskService(new MetamaskRepository());
