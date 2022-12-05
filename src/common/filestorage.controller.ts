import {fileStorageService} from "./filestorage.service"
import {Request, Response} from "express";
import {json} from "../common/controller";
import {necessary, resultAppend} from "../common/util";
class FileStorageController {
    public getFile() {
        return async (req: Request, res: Response) => {
            try {
                const filename = req.params.file;
                res.send(fileStorageService.readFile(filename));
            } catch (err) {
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }
}

export const fileStorageController = new FileStorageController();