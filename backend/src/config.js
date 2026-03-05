import 'dotenv/config';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const defaultFrontendOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://ehr-fe.onrender.com'];
const envFrontendOrigins = parseCsv(process.env.FRONTEND_URLS);
const primaryFrontendUrl =
  process.env.FRONTEND_URL || envFrontendOrigins[0] || defaultFrontendOrigins[0];

export const config = {
  port: toNumber(process.env.PORT, 4001),
  frontendUrl: primaryFrontendUrl,
  frontendOrigins: [
    ...new Set([primaryFrontendUrl, ...envFrontendOrigins, ...defaultFrontendOrigins])
  ],
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from:
      process.env.RESEND_FROM ||
      process.env.SMTP_FROM ||
      'MediPortal <onboarding@resend.dev>'
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: toNumber(process.env.SMTP_PORT, 587),
    secure: toBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'MediPortal <emekaafoama@gmail.com>'
  }
};

export const isSmtpConfigured = Boolean(
  config.smtp.host && config.smtp.user && config.smtp.pass
);

export const isResendConfigured = Boolean(config.resend.apiKey);
