const nodemailer = require('nodemailer');

const {
  USE_ETHEREAL_HOST,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  SENDER_EMAIL,
  BASE_URL,
} = process.env;
const ETHEREAL_HOST = 'smtp.ethereal.email';

const mailConfig = {
  host: MAIL_HOST,
  port: MAIL_PORT || 587,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
};

let transporter;

if (USE_ETHEREAL_HOST === 'true') {
  nodemailer.createTestAccount((err, account) => {
    transporter = nodemailer.createTransport({
      ...mailConfig,
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  });
} else {
  transporter = nodemailer.createTransport(mailConfig);
}

const logTestMessageUrl = (result) => {
  if (MAIL_HOST === ETHEREAL_HOST || USE_ETHEREAL_HOST === 'true') {
    console.log(
      `📬 Preview email test URL: ${nodemailer.getTestMessageUrl(result)}`
    );
  }
};

const sendUserVerificationMail = async (
  email,
  token,
  pathname = '/auth/verify'
) => {
  const message = {
    from: `Den <${SENDER_EMAIL}>`,
    to: email,
    subject: 'Confirm your email address',
    html: `
      <h1>Thank you for your registration</h1>
      <p>Please confirm your email address</p>
      <div>
        <a href="${BASE_URL}${pathname}?token=${token}">Link</a>
      </div>
    `,
  };

  const info = await transporter.sendMail(message);
  logTestMessageUrl(info);
  return info;
};

const sendPasswordResetMail = async (
  email,
  token,
  pathname = '/password-reset'
) => {
  const message = {
    from: `Den <${SENDER_EMAIL}>`,
    to: email,
    subject: 'Password reset',
    html: `
      <h1>We have received your password reset request</h1>
      <p>Please, follow this link and enter new password</p>
      <div>
        <a href="${BASE_URL}${pathname}?token=${token}">Link</a>
      </div>
    `,
  };

  const info = await transporter.sendMail(message);
  logTestMessageUrl(info);
  return info;
};

module.exports = {
  sendUserVerificationMail,
  sendPasswordResetMail,
};
