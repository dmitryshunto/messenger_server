import nodemailer, {Transporter} from 'nodemailer'
import { APP_PASSWORD, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '../config'

export class MailService {
    transporter: Transporter

    constructor() {
        this.transporter = nodemailer.createTransport(
            {
                host: SMTP_HOST,
                port: SMTP_PORT,
                secure: false,
                auth: {
                    user: SMTP_USER,
                    pass: APP_PASSWORD
                }
            }
        )
    }
    async sendActiovationMessage(to: string, link: string) {
        this.transporter.sendMail({
            from: SMTP_USER,
            to,
            subject: "Messager Account Activation",
            html:
                `
                    <div>
                        <p>For activation your account follow the link:</p>
                        <a href="${link}">Activate</a>
                    </div>
                `
        })
    }
}

export default new MailService()