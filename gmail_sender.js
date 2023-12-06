const {google} = require("googleapis");
const nodemailer = require("nodemailer");


const CLIENT_ID ='294292358932-ccgrgshcb508n7ddvrn7pmd9c9n3q54l.apps.googleusercontent.com';
const CLIENT_SECRET ='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';
const REDIRECT_URI ='https://developers.google.com/oauthplayground';
const REFRESH_TOKEN ='1//04zBEK2VMjnFMCgYIARAAGAQSNwF-L9Ir_IYXVy7zNCA4rrolGDJ8xm71japLzZtDcGWMmvCqt0a9Tu-qMubTWMfXh4nGNTXpdqY';

const sender = "contact.algeriainvestconference@gmail.com"

const OAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
OAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN});


async function sendEmail ({to, subject, html}) {
    try {
        const accessToken = await OAuth2Client.getAccessToken(); 

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth:{
                type : "OAuth2",
                user: sender,
                clientId : CLIENT_ID,
                clientSecret : CLIENT_SECRET,
                refreshToken : REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        const options = {
            from : `AIC-ALGERIA INVESTMENT CONFERENCE <${sender}>`,
            to,
            subject,
            html
        }

        const result = await transport.sendMail(options);
        return result;
    } catch (e) {
        return e.message;
    }
}

// sendEmail({
//     to: "abdoufma@gmail.com, chenoufimad96@gmail.com",
//     subject: "Test 2",
//     html: "<h2>This is a test message sent using Nodemailer and Gmail</h2>"
// })

// .then(console.log)
// .catch(e => console.error(e.message));

module.exports = {sendEmail}
