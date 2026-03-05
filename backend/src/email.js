import nodemailer from 'nodemailer';
import { config, isResendConfigured, isSmtpConfigured } from './config.js';

let transporter;
let usingEthereal = false;

const createTransporter = async () => {
  if (isSmtpConfigured) {
    usingEthereal = false;
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  usingEthereal = true;

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }

  return transporter;
};

const sendWithResend = async ({ to, subject, html, text }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resend.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: config.resend.from,
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend API error (${response.status}): ${details}`);
  }
};

const sendMail = async ({ to, subject, html, text }) => {
  if (isResendConfigured) {
    await sendWithResend({ to, subject, html, text });
    return;
  }

  const mailer = await getTransporter();
  const info = await mailer.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
    html
  });

  if (usingEthereal) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log(`Preview email for ${to}: ${preview}`);
    }
  }
};

export const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
  await sendMail({
    to,
    subject: 'Verify your MediPortal account',
    text: `Hi ${name}, verify your email by opening this link: ${verificationUrl}`,
    html: `<p>Hi ${name},</p><p>Please verify your MediPortal account:</p><p><a href=\"${verificationUrl}\">Verify Email</a></p><p>If you did not request this, you can ignore this email.</p>`
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  await sendMail({
    to,
    subject: 'Welcome to MediPortal',
    text: `Hi ${name}, your MediPortal account has been created successfully.`,
    html: `<p>Hi ${name},</p><p>Your MediPortal account has been created successfully.</p><p>You can now sign in and access your portal.</p>`
  });
};

export const sendOtpEmail = async ({ to, name, otp }) => {
  await sendMail({
    to,
    subject: 'Your MediPortal OTP code',
    text: `Hi ${name}, your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Hi ${name},</p><p>Your One-Time Password is:</p><p style=\"font-size:24px;font-weight:bold;letter-spacing:2px;\">${otp}</p><p>This code expires in 10 minutes.</p>`
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  await sendMail({
    to,
    subject: 'Reset your MediPortal password',
    text: `Hi ${name}, reset your password here: ${resetUrl}`,
    html: `<p>Hi ${name},</p><p>Reset your password by clicking below:</p><p><a href=\"${resetUrl}\">Reset Password</a></p><p>This link expires in 1 hour.</p>`
  });
};
