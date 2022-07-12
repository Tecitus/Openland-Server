import * as cron from 'node-cron';
import { runSql } from '../common/db/database';
import { courseService } from '../course/course.service';
import { adjustService } from '../adjust/adjust.service';
import { pointService } from '../course/point.service';
import { aligo } from './aligo';

export function cronjob(): void {
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('20 3,15 * * *', () => {
      runSql('DELETE FROM board_read_log;');
    });
    cron.schedule('0 0 * * *', () => {
      pointService.calculatePointEveryMidNight();
    });
    cron.schedule('1 0 * * *', () => {
      courseService.vbankExpireAtMidnight();
    });
    cron.schedule('1 2 * * *', () => {
      adjustService.adjustDaily();
    });
    cron.schedule('5 2 26 * *', () => {
      adjustService.adjustForOnline();
    });
    cron.schedule('11 2 26 * *', () => {
      adjustService.adjustMonthly();
    });
    cron.schedule('1 3 * * *', () => {
      courseService.sendAlimTalkBeforeStartForLive();
    });
    cron.schedule('0 11 * * *', () => {
      courseService.sendAlimTalkAfterEndDate();
    });
    cron.schedule('2 11 * * *', () => {
      courseService.cancelNotReceivedGift();
    });
    cron.schedule('3 11 * * *', () => {
      aligo.availableCount();
    });
    cron.schedule('0 13 * * *', () => {
      courseService.sendAlimTalkBeforeStartDate();
    });
    cron.schedule('0 22 * * *', () => {
      courseService.classOptionStatusBatch();
    });
  }
}
