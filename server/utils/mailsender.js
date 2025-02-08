const nodemailer = require("nodemailer");
require("dotenv").config();
const mailsender = async (email, title, body) => {
    try{
            let transporter = nodemailer.createTransport({
                host:process.env.MAIL_HOST,
                auth:{
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                }
            })


            let info = await transporter.sendMail({
                from: 'Event Management Portal',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            return { info };
    }
    catch(error) {
        res.status(500).send({
            success: false,
            message:"Error in sending mail",
        })
    }
}


module.exports = mailsender;