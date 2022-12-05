import multer from 'multer'
import fs from 'fs'
import {nanoid} from 'nanoid';
//import fileextension from 'file-extension';
/* eslint-disable */
const fileextension =  require('file-extension');

export class FileStorageService
{
    private fileExistCheck: {[name:string] : boolean} = {}// 파일이 이미 존재하는지 여부를 캐싱

    public uploader : multer.Multer
    constructor(private filedestination:string = "./storage/")
    {
        const tempfileExistCheck = this.fileExistCheck;
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, filedestination)
            },
            filename: function (req, file, cb) {
              //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
              let splits = file.originalname.split('.');
              const name = nanoid(64) + '.' + splits[splits.length - 1].toLowerCase();
              tempfileExistCheck[name] = true;
              cb(null, name);
            }
          })
        this.uploader = multer({storage: storage});
    }

    //주어진 파일 이름(과 확장자)에 파일 저장, 파일 이름 반환
    public writeFile(data:Buffer, extension:string): string
    {
        try{
            const name = nanoid(64) + '.' + extension;
            fs.writeFileSync(this.filedestination + name, data);
            this.fileExistCheck[name] = true;
            return name;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }

    public writeFileWithName(name:string, data:Buffer): string
    {
        try{
            fs.writeFileSync(this.filedestination + name, data);
            this.fileExistCheck[name] = true;
            return name;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }

    //주어진 이름 또는 경로에 파일이 존재하는지 여부 반환
    public exists(path:string): boolean
    {
        try{
            const result = fs.existsSync(this.filedestination + path);
            if(result)
            {
                this.fileExistCheck[path] = true;
            }
            return result;
        }
        catch(err){
            console.log(err);
            return false;
        }
    }

    public readFile(path:string) : Buffer
    {
        try{
            if(this.fileExistCheck[path] || this.exists(path)){
                return fs.readFileSync(this.filedestination + path);
            }
            else
            {
                return null;
            }
        }
        catch(err){
            console.log(err);
            return null;
        }
    }

    public renameFile(from:string, to:string): boolean
    {
        try{
            if(this.fileExistCheck[from] || this.exists(from)){
                fs.renameSync(this.filedestination + from, this.filedestination + to);
                this.fileExistCheck[from] = undefined;
                this.fileExistCheck[to] = true;
            }
            else
            {
                return false;
            }
        }
        catch(err){
            console.log(err);
            return false;
        }
    }
}

export const fileStorageService = new FileStorageService();