import * as mailer from "nodemailer";
import Tester from "../models/Tester";
import Sender from "../models/Sender";
import Task from "../models/Task";
import path = require("path");
import { genMail } from "./templateGen";
import MailTemplate from "../models/MailTemplate";

const sendMail = (async (tester: Tester[], sender: Sender, mailId: string, taskId: string) => {
    let Email = {
        host: sender.host,
        port: sender.port,
        secure: sender.secure,
        auth: {
            user: sender.user,
            pass: sender.pass
        }
    };
    let errInfo: any = [];

    let transporter = mailer.createTransport(Email);
    for (let i = 0; i < tester.length; i++) {
        const e = tester[i];
        let mailCont = genMail(taskId, e.id, mailId);
        
        let msg = {
            from: sender.user,
            to: e.mail,
            subject: "登录认证",
            html: mailCont
        };

        transporter.sendMail(msg, (err, res) => {
            if (err !== null || err !== undefined) {
                errInfo.push(errInfo);
                console.log("Mail " + res.messageId + " Err");
                console.log(err);
            } else {
                console.log("Mail " + res.messageId + " OK");
            }
        });
    }
});

export default sendMail;