'use strict'

import transport from "../dbs/init.nodemailer.js";
import { replaceEmail } from "../utils/index.js";
import { templatePassword } from "../utils/template.js";


const sendEmailCommon = async ({
    html,
    toEmail,
    subject
}: {
    html: string,
    toEmail: string,
    subject: string
}) => {
    try {
        const mailOptions = {
            from: ' "JiLee Company" <lqchi.service@gmail.com> ',
            to: toEmail,
            subject,
            html
        }

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.error(err)
            }
        })

    } catch (error) {
        console.error(`Error for sending email: `, error)
        return error;
    }
}


const sendEmailPassword = async ({
    email, token
}: {
    email: string;
    token: number
}): Promise<number> => {
    const content = replaceEmail({
        template: templatePassword()
        , params: { token }

    })

    sendEmailCommon({
        html: content,
        toEmail: email,
        subject: "Mã xác nhận thay đổi password"
    }).catch(err => console.error(err))
    
    return token;
}

export {
    sendEmailPassword
}