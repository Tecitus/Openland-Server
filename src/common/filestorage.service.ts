import multer from 'multer'
import fs from 'fs'

export class FileStorageService
{
    private fileExistCheck: {[name:string] : boolean} // 파일이 이미 존재하는지 여부를 캐싱

    public uploader : multer.Multer
    constructor(private filedestination:string = "/home/public/collection_temp")
    {
        this.uploader = multer({dest:filedestination});
    }

    //주어진 파일 이름(과 확장자)에 파일 저장
    public writeFile(name:string, data:any): boolean
    {
        try{
            fs.writeFileSync(this.filedestination + name, data);
            return true
        }
        catch(err){
            console.log(err);
            return false;
        }
    }

    //주어진 이름 또는 경로에 파일이 존재하는지 여부 반환
    public exists(path:string): boolean
    {
        try{
            let result = fs.existsSync(this.filedestination + path);
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
            let result = fs.readFileSync(this.filedestination + path);
            return result;
        }
        catch(err){
            console.log(err);
            return null;
        }
    }
}

export const fileStorageService = new FileStorageService();