// @ts-ignore
import nodemailer from "nodemailer";

const process_env = {
    SMTP_HOST: "smtp.office365.com",
    SMTP_PORT: 587,
    SMTP_SECURE: false,
    SMTP_PASSWORD: "Bob14725",
    SMTP_USERNAME: "noreply-event@chabe.fr",
};

export interface Attachement {
    filename: string;
    path: string;
    contentType: string;
}

export class MailService {
    private initTransporter() {
        return nodemailer.createTransport({
            host: process_env.SMTP_HOST,
            port: process_env.SMTP_PORT,
            secure: process_env.SMTP_SECURE,
            tls: {
                ciphers: "SSLv3",
            },
            auth: {
                user: process_env.SMTP_USERNAME,
                pass: process_env.SMTP_PASSWORD,
            },
        });
    }

    public sendMail(from: string, to: string, subject: string, attachments: Attachement[], text: string) {
        const transporter = this.initTransporter();
        const mailOptions = {
            from,
            to,
            subject,
            attachments,
            text,
        };
        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                console.error(error);
                return false;
            }

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return true;
        });
    }
}

export const mailService = new MailService();
