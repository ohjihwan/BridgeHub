const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('이메일 설정이 필요합니다. .env 파일에 EMAIL_USER와 EMAIL_PASS를 설정해주세요.');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async sendVerificationEmail(email, code) {
        try {
            await this.transporter.sendMail({
                from: {
                    name: 'BridgeHub',
                    address: process.env.EMAIL_USER
                },
                replyTo: process.env.EMAIL_USER,
                to: email,
                subject: 'BridgeHub 이메일 인증',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin-bottom: 10px;">BridgeHub 이메일 인증</h1>
                            <p style="color: #666; font-size: 16px;">회원가입을 위한 인증 코드입니다.</p>
                        </div>
                        
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <p style="color: #333; font-size: 18px; margin-bottom: 20px;">아래의 인증 코드를 입력해주세요:</p>
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${code}</span>
                            </div>
                            <p style="color: #666; font-size: 14px;">이 인증 코드는 5분 동안 유효합니다.</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="color: #666; font-size: 12px;">
                                이 이메일은 BridgeHub에서 발송되었습니다.<br>
                                본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
                            </p>
                        </div>
                    </div>
                `
            });
            return true;
        } catch (error) {
            console.error('이메일 전송 실패:', error);
            return false;
        }
    }
}

module.exports = new EmailService(); 