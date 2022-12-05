import {assetService} from "../asset/asset.service"
import {userService} from "../user/user.service"
import {collectionService} from "../collection/collection.service"
import {metamaskService} from "../metamask/metamask.service"
import {fileStorageService} from "../common/filestorage.service"
import fs from "fs";

export async function wrapper(){
    const datas = JSON.parse(fs.readFileSync("exampledata/dataset.json",'utf8'))
    let colidx = 0;
    let asidx = 0;
    for(let i = 0; i < datas.users.length; i++) {
        const profileimgbuffer = fs.readFileSync("exampledata/images/"+datas.users[i].picture);
        const profileimg = fileStorageService.writeFile(profileimgbuffer, 'png');
        const user = await userService.createNewUser({
            username:datas.users[i].username,
            email:datas.users[i].email,
            password:datas.users[i].password,
            nickname:datas.users[i].nickname,
            picture:profileimg
        });

        const metamask = await metamaskService.createMetamaskData(datas.users[i].account, user.id);

        for(let j = 0; j < 3; j++, colidx++)
        {
            const logoimg = fileStorageService.writeFile(fs.readFileSync("exampledata/images/"+datas.collections[colidx].logoimg),'png');
            const featuredimg = fileStorageService.writeFile(fs.readFileSync("exampledata/images/"+datas.collections[colidx].featuredimg),'png');
            const bannerimg = fileStorageService.writeFile(fs.readFileSync("exampledata/images/"+datas.collections[colidx].bannerimg),'png');
            const collection = await collectionService.createCollection({
                logoimg:logoimg,
                featuredimg:featuredimg,
                bannerimg:bannerimg,
                name:datas.collections[colidx].name,
                description:datas.collections[colidx].description,
                creator: user.id
            });

            for(let k = 0; k < 10; k++, asidx++)
            {
                const image = fs.readFileSync("exampledata/images/"+datas.assets[asidx].file);
                const asset = await assetService.createNewAsset({
                    name: datas.assets[asidx].name,
                    symbol:datas.assets[asidx].symbol,
                    description: datas.assets[asidx].description,
                    image: image,
                    collectionid:collection.id,
                    creater: user.id,
                    tokennumber: 1,
                    creatoraddress: datas.users[i].account
                })
            }
        }
    }
}