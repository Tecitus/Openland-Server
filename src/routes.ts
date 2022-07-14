import * as express from 'express';
import { user } from './user/user.controller';
import { InstaController } from './insta/insta.controller';
import { InstaService } from './insta/insta.service'
import { nftController } from './nft/nft.controller'
import { metamask } from './metamask/metamask.controller'


export function routes(app: express.Application) {
  const router: express.Router = express.Router();
  const bothLoginOrNot = user.authCheck();
  const protect = user.authGuard();
  const teacherProtect = [user.authGuard(), user.getLevel()];
  // const keywordProtect = [user.checkKeyword()];
  const OnlyMasterProtect = [user.authGuard(), user.getLevel(), user.checkMaster()];
  const versionProtect = [user.checkVersion()];
  const insta = new InstaController(new InstaService());

  router.post('/users', user.create());
  router.post('/users/:id', protect, user.update());
  router.post('/auth/login', user.login());
  //router.post('/auth/teacherlogin', user.teacherlogin());
  router.post('/auth/logout', user.logout());
  router.post('/auth/refresh', protect, user.refresh());
  router.post('/auth/refreshCall', protect, user.refreshCall());
  //router.post('/auth/teacherRefresh', teacherProtect, user.teacherRefresh());
  router.post('/auth/verification/email/confirm', user.confirmEmailVerification());
  router.get('/auth/verification/email', protect, user.sendEmailVerification());
  router.post('/auth/verification/phone/confirm', protect, user.confirmPhoneVerification());
  router.post('/auth/verification/phone', protect, user.sendPhoneVerification());
  router.post('/auth/forgotpassword', user.forgotpassword());
  router.post('/auth/resetpassword', user.authGuardForPassword(), user.resetPassword());
  router.post('/auth/updatepassword', user.authGuardForUpdatePassword(), user.resetPassword());
  router.get('/auth/callback/facebook', user.facebookLogin());
  router.get('/auth/callback/kakao', user.kakaoLogin());
  router.get('/auth/callback/naver', user.naverLogin());
  router.post('/snsusers', protect, user.snsTerm());
  //router.get('/auth/gift/:id', user.getGiftInfo());
  //router.post('/auth/gift', protect, user.setGift());

  router.get('/insta/getImages', insta.getImages());
  router.get('/insta/getToken', insta.getToken());
  // router.get('/auth/login/verification/getToken', insta.getToken());

  //router.get('/homeList', nftController.getHomeList());

  app.use(router);
}
