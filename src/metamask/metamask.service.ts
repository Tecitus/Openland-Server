import {Metamask} from './metamask';
import * as requestPromise from 'request-promise-native';
import {appConfig} from '../app-config';
import {MetamaskRepository} from './metamask.repository';
import {nanoid} from 'nanoid/non-secure';
import {UserRepository} from "../user/user.repository";
import {UserService} from "../user/user.service";
import {web3} from "../solidity/Web3Service";

export class MetamaskService {
    constructor(private metamaskRepository: MetamaskRepository) {
    }

    // TODO : checkUserExit
    public async getMetamaskData(address: string): Promise<Metamask> {
        try {
            return await this.metamaskRepository.getMetamaskData(address);
        } catch (err) {
            console.log(err);
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

    public async createMetamaskData(address: string, user: number) : Promise<Metamask>
    {
        try {
            return await this.metamaskRepository.createMetamaskData({address:address, userid:user} as Metamask)
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }

    public async getMetamaskDataWithUserId(userid: number): Promise<Metamask[]> {
        try {
            return await this.metamaskRepository.getMetamaskDataByUserId(userid);
        } catch (err) {
            return await Promise.reject(err.message);
        }
    }
}

export const metamaskService = new MetamaskService(new MetamaskRepository());
