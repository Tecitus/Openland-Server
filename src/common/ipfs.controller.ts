import {fileStorageService} from "./filestorage.service"
import {ipfsService} from "./ipfs.service"
import {Request, Response} from "express";
import {json} from "../common/controller";
import {resultAppend} from "../common/util";
class IPFSController {
    public getIFPSFile() {
        return async (req: Request, res: Response) => {
            try {
                const hash = req.params.hash;
                res.send(await ipfsService.getFileFromHash(hash));
                return;
            } catch (err) {
                console.log(err)
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }

    public uploadFile()
    {
        return async (req: Request, res: Response) => {
            try {
                const filename = req.file.filename;
                const filebuffer = fileStorageService.readFile(filename);
                res.send(await ipfsService.uploadFile(filebuffer));
                return;
            } catch (err) {
                console.log(err)
                json(res, resultAppend({}, false, `${err.message}`), 400);
            }
        }
    }
}

export const ipfsController = new IPFSController();