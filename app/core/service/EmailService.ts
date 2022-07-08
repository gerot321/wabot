import { Env } from "../index";
import * as nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export class EmailService {
  private static transporter() {
    return nodemailer.createTransport({
      host: Env().mail.host,
      port: Env().mail.port,
      secure: Env().mail.secure,
      auth: {
        user: Env().mail.auth.user,
        pass: Env().mail.auth.pass,
      },
    });
  }

  static async sendEmail(options: Mail.Options) {
    return this.transporter().sendMail({
      from: Env().fromEmailAddress,
      ...options,
    });
  }
}
