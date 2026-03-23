import * as fs from "fs";
import * as path from "path";

export function genMail(taskId: string, testerId: string, mailId: string): string {
    let mail = fs.readFileSync(path.join(__dirname, `../files/mail/${mailId}.html`)).toString();
    return mail.replace(/\$PA\$/g, `taskId=${taskId}&testerId=${testerId}`);
}

export function genPage(taskId: string, testerId: string, mailId: string): string {
    let page = fs.readFileSync(path.join(__dirname, `../files/page/${mailId}.html`)).toString();
    return page.replace(/\$PA\$/g, `taskId=${taskId}&testerId=${testerId}`);
}