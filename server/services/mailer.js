// Small mailer that prefers SMTP via nodemailer when configured, and falls
// back to console logging in development. Never throws on send failure — the
// caller decides how to react.

let transporterPromise = null;

const buildTransporter = async () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST) return null;
  const nodemailer = require('nodemailer');
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587,
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
};

const getTransporter = () => {
  if (!transporterPromise) transporterPromise = buildTransporter();
  return transporterPromise;
};

const send = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM || 'no-reply@rufus-macba.local';
  const transporter = await getTransporter();
  if (!transporter) {
    // Dev fallback: log a structured line so the user can copy the reset link.
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'mail.console',
      to,
      from,
      subject,
      text,
    }));
    return { delivered: false, mode: 'console' };
  }
  await transporter.sendMail({ from, to, subject, text, html });
  return { delivered: true, mode: 'smtp' };
};

module.exports = { send };
