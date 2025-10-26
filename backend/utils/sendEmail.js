const nodemailer = require('nodemailer');

let cachedTransporter = null;

const resolveTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error('Email configuration is incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD.');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return cachedTransporter;
};

module.exports = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error('Missing recipient email address.');
  }

  const transporter = resolveTransporter();
  const from = process.env.EMAIL_FROM || 'Project Allocation System <noreply@projectallocation.com>';

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html: html || (text ? `<p>${text}</p>` : undefined)
  };

  await transporter.sendMail(mailOptions);
};
