import * as nodemailer from 'nodemailer';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';
import * as Mail from 'nodemailer/lib/mailer';
import { MailConfig } from '../config';

export class EMail {
  private transporter: nodemailer.Transporter;

  public async connection(mailConfig: MailConfig): Promise<any> {
    const Options: SMTPPool.Options = {
      pool: true,
      host: mailConfig.host,
      port: mailConfig.port,
      secure: false,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    };

    try {
      const aTransporter: nodemailer.Transporter = nodemailer.createTransport(Options);
      await aTransporter.verify();
      this.transporter = aTransporter;
      return await Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async sendMail(
    sender: string,
    receiver: string,
    title: string,
    contentType: string,
    emailValues: any
  ): Promise<any> {
    if (process.env.NODE_ENV === 'production') {
      try {
        const sendHtml = this.makeContent(contentType, emailValues);
        const mailOptions: Mail.Options = {
          from: sender,
          to: receiver,
          subject: title,
          html: sendHtml,
        };
        await this.transporter.sendMail(mailOptions);
        return await Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return await Promise.resolve();
    }
  }

  public async sendErrorEmail(errorText: string) {
    await this.sendMail(
      'sundaynamaste<noreply@sundaynamaste.com>',
      'jinbju@gmail.com',
      '[sundaynamaste] DB오류',
      'error',
      {
        url: 'https://www.sundaynamaste.com',
        text: errorText,
      }
    );
  }

  private makeContent(contentType: string, emailValues: any) {
    let title = '';
    let body = '';
    if (contentType === 'verification') {
      title = this.setHeader('본인 인증');
      body = this.setBodyVerification(emailValues);
    } else if (contentType === 'reset') {
      title = this.setHeader('비밀번호 재설정');
      body = this.setBodyReset(emailValues);
    } else if (contentType === 'new') {
      title = this.setHeader('새로운 수업 신청');
      body = this.setBodyDefault(emailValues);
    } else if (contentType === 'confirm') {
      title = this.setHeader('수업신청 완료');
      body = this.setBodyDefault(emailValues);
    } else if (contentType === 'cancel') {
      title = this.setHeader('수업취소');
      body = this.setBodyDefault(emailValues);
    } else if (contentType === 'error') {
      title = this.setHeader('error');
      body = this.setBodyDefault(emailValues);
    }
    return title + body + this.setFooter();
  }

  private setHeader(title: string) {
    return (
      '<html>' +
      '  <head>' +
      '    <meta http-equiv="content-type" content="text/html; charset=utf-8">' +
      '  </head>' +
      '  <body>' +
      '    <table cellspacing="0" cellpadding="0" border="0" align="center" width="800" style="margin:0 auto">' +
      '      <tr>' +
      '        <td height="44"></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td>' +
      '          <table cellspacing="0" cellpadding="0" border="0">' +
      '            <tr>' +
      '              <td valign="top" width="700" style="font-size:18px; color:#FEAE4A; ' +
      "              font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; " +
      '              line-height:21px; letter-spacing:-0.4px">' +
      title +
      '</td>' +
      '              <td valign="top" width="100">' +
      '                <a href="https://www.sundaynamaste.com" target="_blank" ' +
      'style="display:inline-block;vertical-align:top">' +
      '                  <img src="https://static.sundaynamaste.com/images/logo.png" ' +
      'width="100" style="display:block" alt="logo"/>' +
      '                </a>' +
      '              </td>' +
      '            </tr>' +
      '          </table>' +
      '        </td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td height="42"></td>' +
      '      </tr>'
    );
  }

  private setBodyVerification(emailValues: any) {
    return (
      '      <tr>' +
      '        <td valign="top" style="font-size:15px; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:24px; " +
      'letter-spacing:-0.5px">본인 이메일 확인을 위한 인증 메일입니다.</td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td valign="top" style="font-size:15px; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:24px; " +
      'letter-spacing:-0.5px">' +
      '        <span>방금 sunday namaste에 가입하셨다면 <strong>‘이메일 인증’</strong> 버튼을 클릭해주세요.</span></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td height="42"></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td height="42"></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td valign="top">' +
      '          <a href="' +
      emailValues.url +
      '" target="_blank" style="display:inline-block">' +
      '            <img src="https://static.sundaynamaste.com/images/mail_verification.png" width="200" ' +
      'height="30" border="0" style="display:block" alt="이메일 인증"/>' +
      '          </a>' +
      '        </td>' +
      '      </tr>'
    );
  }

  private setBodyReset(emailValues: any) {
    return (
      '      <tr>' +
      '        <td valign="top" style="font-size:15px; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:24px; " +
      'letter-spacing:-0.5px">회원님의 비밀번호를 재설정하기 위한 인증 메일입니다.</td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td valign="top" style="font-size:15px; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:24px; " +
      'letter-spacing:-0.5px"><strong style="color:#FEAE4A">' +
      emailValues.name +
      '</strong>' +
      '        <span>님 본인이 맞으시면 <strong>‘비밀번호 재설정하기’</strong> ' +
      '버튼을 클릭해주세요.</span></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td height="42"></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td valign="top">' +
      '          <a href="' +
      emailValues.url +
      '" target="_blank" style="display:inline-block">' +
      '            <img src="https://static.sundaynamaste.com/images/password_reset.svg" ' +
      'width="200" height="30" ' +
      'border="0" style="display:block" alt="비밀번호 재설정하기"/>' +
      '          </a>' +
      '        </td>' +
      '      </tr>'
    );
  }

  private setBodyDefault(emailValues: any) {
    emailValues.text = emailValues.text.replace(/\n/g, '<br>');
    return (
      '      <tr>' +
      '        <td valign="top" style="font-size:15px; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:24px; " +
      'letter-spacing:-0.5px"><div>' +
      emailValues.text +
      '</div></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td valign="top">' +
      '          <a href="' +
      emailValues.url +
      '" target="_blank" style="display:inline-block">' +
      '확인하러 가기' +
      '          </a>' +
      '        </td>' +
      '      </tr>'
    );
  }

  private setFooter() {
    return (
      '      <tr>' +
      '        <td height="42"></td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td valign="top" style="font-weight: lighter; font-size:15px; color:#A8A8A8; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; " +
      'line-height:24px; letter-spacing:-0.5px">본 메일은 안내메일로 발신전용 메일입니다.<br>' +
      '문의사항은 help@sundaynamaste.com 을 통해 문의해주시기 바랍니다.</td>' +
      '      </tr>' +
      '      <tr>' +
      '        <td height="42"></td>' +
      '      </tr>' +
      '      <tr style="background-color:#454545">' +
      '        <td>' +
      '          <table cellspacing="0" cellpadding="0" border="0">' +
      '            <tr>' +
      '              <td height="30"></td>' +
      '            </tr>' +
      '            <tr>' +
      '              <td width="10"></td>' +
      '              <td valign="top">' +
      '                <img src="https://static.sundaynamaste.com/images/logo.png" width="100" ' +
      'style="display:block" alt="logo"/>' +
      '              </td>' +
      '            </tr>' +
      '            <tr>' +
      '              <td height="30"></td>' +
      '            </tr>' +
      '            <tr>' +
      '              <td width="10"></td>' +
      '              <td valign="top" style="font-weight: lighter; font-size:13px; color:#FFF; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:20px;\">" +
      'help@sundaynamaste.com</td>' +
      '            </tr>' +
      '            <tr>' +
      '              <td height="10"></td>' +
      '            </tr>' +
      '            <tr>' +
      '              <td width="10"></td>' +
      '              <td valign="top" style="font-weight: lighter; font-size:13px; color:#FFF; ' +
      "font-family:'Apple SD Gothic NEO','맑은 고딕','Malgun Gothic', Sans-serif; line-height:20px;\">" +
      '© SundayNamaste. All rights reserved.</td>' +
      '            </tr>' +
      '            <tr>' +
      '              <td height="30"></td>' +
      '            </tr>' +
      '          </table>' +
      '        </td>' +
      '      </tr>' +
      '    </table>' +
      '  </body>' +
      '</html>'
    );
  }
}

export const email = new EMail();
