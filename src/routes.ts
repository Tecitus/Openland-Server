import * as express from 'express';
import { user } from './user/user.controller';
import { collectionController } from './collection/collection.controller';
import { metamask } from './metamask/metamask.controller'
import { fileStorageService } from './common/filestorage.service';
import {fileStorageController} from './common/filestorage.controller'
import { ipfsController } from './common/ipfs.controller';
import { assetController} from './asset/asset.controller';
import bodyParser from 'body-parser';
import { solidityController } from './solidity/solidity.controller';
let jsonparser = bodyParser.json();


export function routes(app: express.Application) {
  const router: express.Router = express.Router();

  router.post('/users/register', fileStorageService.uploader.single('attachment'),user.registerUser());
  router.post('/users/signin',user.signIn());
  router.get('/users/user/:id',user.getUserData());
  router.get('/users/getprofiledata/:id', user.getProfileData());
  router.post('/users/session',user.getSessionData());
  router.post('/users/logout',user.logout());

  router.post('/collections/createcollection', fileStorageService.uploader.fields([{name:"logoimage"}, {name:"featuredimage"},{name:"bannerimage"}]), collectionController.createCollection())
  router.get('/collections/collection/:id', collectionController.getCollectionInfo());
  router.get('/collections/mycollections', collectionController.getMyCollectionLists());
  router.get('/collections/countassets/:collectionid', collectionController.countAssets());
  router.get('/collections/getrandom/:amount', collectionController.getRandomCollections());
  router.get('/collections/assets/:collectionid', collectionController.getAssetsByCollectionId());
  router.get('/collections/findcollections', collectionController.findCollections());
  router.get('/collections/getactivities', collectionController.getActivitiesByCollection());
  router.get('/collections/getadditionalinfo/:collectionid', collectionController.getAdditionalInfo());

  router.get('/metamasks/nonce/:address', metamask.getNonce());
  router.get('/metamasks/metamask/:address', metamask.getMetamaskData());
  router.post('/metamasks/signature', metamask.joinOrLogin());

  //router.post('/assets/createasset', fileStorageService.uploader.single('image'), assetController.createAsset())
  router.post('/assets/createasset', assetController.createAsset())
  router.get('/assets/asset/:id', assetController.getAssetData());
  router.get('/assets/getrandomassets/:amount', assetController.getRandomAssetDatas());
  router.get('/assets/assetoken/:assetid/:index', assetController.getAssetToken());
  router.get('/assets/getlistact', assetController.getListActivities());
  router.get('/assets/getofferact', assetController.getOfferActivities());
  router.get('/assets/getprofileassetdata', assetController.getProfileAssetData());
  router.get('/assets/getfavoritesbyuserid', assetController.getFavoritesByUserId());
  router.get('/assets/createfavorite/:assetid', assetController.createFavorite());
  router.get('/assets/findassets', assetController.findAssets());

  router.get('/ipfs/:hash', ipfsController.getIFPSFile());
  router.post('/ipfs/uploadfile', fileStorageService.uploader.single('attachment'),ipfsController.uploadFile());
  router.get('/files/:file', fileStorageController.getFile());

  router.get('/solidity/getbytecode', solidityController.getByteCode());

  router.get("/activities/getactivitiesfromasset", assetController.getActivitiesFromAsset());
  router.get("/activities/getactivities", assetController.getActivities());
  router.get('/activities/getlistact', assetController.getListActivities());
  router.get('/activities/getofferact', assetController.getOfferActivities());
  router.post('/activities/acceptlist', assetController.acceptListing());
  router.post('/activities/acceptoffer', assetController.acceptOffer());
  router.post('/activities/createlist', assetController.createList());
  router.post('/activities/createoffer', assetController.createOffer());
  router.post('/activities/transfernft', assetController.transferNFT());
  router.get('/activities/getownedtokensbyasset/:assetid', assetController.getOwnedTokensByAsset())

  router.get("/watches/add/:collectionid", collectionController.addWatch());
  router.get("/watches/getdata", collectionController.getWatches());
  app.use(router);
}
