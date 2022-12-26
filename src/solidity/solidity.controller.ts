import { byteCode, IPFSNFTABI} from "./SolidityService";
import {Request, Response} from "express";


export class SolidityController{
    public getByteCode()
    {
        return async (req: Request, res: Response) =>
        {
            res.send({bytecode:byteCode, abi:IPFSNFTABI});
        }
    }
}

export const solidityController = new SolidityController();