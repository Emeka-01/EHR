import 'dotenv/config';

const cleanEnvString = (value) => {
  if (value === undefined || value === null) return '';

  const trimmed = String(value).trim();
  if (!trimmed) return '';

  const hasMatchingDoubleQuotes =
    trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasMatchingSingleQuotes =
    trimmed.startsWith("'") && trimmed.endsWith("'");

  if (hasMatchingDoubleQuotes || hasMatchingSingleQuotes) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return cleanEnvString(value).toLowerCase() === 'true';
};

const parseCsv = (value) =>
  cleanEnvString(value)
    .split(',')
    .map((item) => cleanEnvString(item))
    .filter(Boolean);

const normalizeFromAddress = (value, fallback) => {
  const candidate = cleanEnvString(value) || fallback;

  if (candidate.includes('<') && !candidate.includes('>')) {
    return `${candidate}>`;
  }

  return candidate;
};

const defaultFrontendOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://ehr-fe.onrender.com'];
const envFrontendOrigins = parseCsv(process.env.FRONTEND_URLS);
const primaryFrontendUrl =
  cleanEnvString(process.env.FRONTEND_URL) ||
  envFrontendOrigins[0] ||
  defaultFrontendOrigins[0];

export const config = {
  port: toNumber(cleanEnvString(process.env.PORT), 4001),
  frontendUrl: primaryFrontendUrl,
  frontendOrigins: [
    ...new Set([primaryFrontendUrl, ...envFrontendOrigins, ...defaultFrontendOrigins])
  ],
  jwtSecret: cleanEnvString(process.env.JWT_SECRET) || 'dev-only-secret-change-me',
  jwtExpiresIn: cleanEnvString(process.env.JWT_EXPIRES_IN) || '1d',
  resend: {
    apiKey: cleanEnvString(process.env.RESEND_API_KEY),
    from: normalizeFromAddress(
      process.env.RESEND_FROM,
      normalizeFromAddress(
        process.env.SMTP_FROM,
        'MediPortal <onboarding@resend.dev>'
      )
    )
  },
  smtp: {
    host: cleanEnvString(process.env.SMTP_HOST),
    port: toNumber(cleanEnvString(process.env.SMTP_PORT), 587),
    secure: toBoolean(process.env.SMTP_SECURE, false),
    user: cleanEnvString(process.env.SMTP_USER),
    pass: cleanEnvString(process.env.SMTP_PASS),
    from: normalizeFromAddress(
      process.env.SMTP_FROM,
      'MediPortal <no-reply@mediportal.local>'
    )
  }
};

export const isSmtpConfigured = Boolean(
  config.smtp.host && config.smtp.user && config.smtp.pass
);

export const isResendConfigured = Boolean(config.resend.apiKey);
