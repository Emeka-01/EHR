import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  comparePassword,
  createId,
  createOtp,
  createToken,
  emailRegex,
  hashPassword,
  hoursFromNow,
  isStrongPassword,
  LOCKOUT_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  minutesFromNow,
  normalizeEmail,
  OTP_EXPIRY_MINUTES,
  RESET_TOKEN_HOURS,
  sanitizeUser,
  VERIFICATION_TOKEN_HOURS
} from './utils.js';
import { config } from './config.js';
import { db, ensureSeedUser } from './store.js';
import {
  sendOtpEmail,
  sendVerificationEmail,
  sendWelcomeEmail
} from './email.js';

const app = express();
const RECENT_SIGNUP_WINDOW_MS = 2 * 60 * 1000;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }
};

app.use(
  cors(corsOptions)
);
app.use(express.json());

const findUserByEmail = (email) =>
  db.data.users.find((user) => user.email === normalizeEmail(email));

const issueToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );

const cleanupExpired = () => {
  const now = Date.now();
  db.data.verificationTokens = db.data.verificationTokens.filter(
    (item) => item.expiresAt > now
  );
  db.data.otpCodes = db.data.otpCodes.filter((item) => item.expiresAt > now);
  db.data.resetTokens = db.data.resetTokens.filter((item) => item.expiresAt > now);
};

const createVerificationToken = (userId) => {
  const token = createToken();
  db.data.verificationTokens = db.data.verificationTokens.filter(
    (item) => item.userId !== userId
  );
  db.data.verificationTokens.push({
    id: createId(),
    userId,
    token,
    expiresAt: hoursFromNow(VERIFICATION_TOKEN_HOURS),
    createdAt: Date.now()
  });

  return token;
};

const createResetToken = (userId) => {
  const token = createToken();
  db.data.resetTokens = db.data.resetTokens.filter((item) => item.userId !== userId);
  db.data.resetTokens.push({
    id: createId(),
    userId,
    token,
    expiresAt: hoursFromNow(RESET_TOKEN_HOURS),
    createdAt: Date.now()
  });

  return token;
};

const createUnlockOtp = (user) => {
  const otp = createOtp();
  db.data.otpCodes = db.data.otpCodes.filter(
    (item) => !(item.userId === user.id && item.purpose === 'unlock')
  );
  db.data.otpCodes.push({
    id: createId(),
    userId: user.id,
    purpose: 'unlock',
    code: otp,
    expiresAt: minutesFromNow(OTP_EXPIRY_MINUTES),
    attemptsLeft: 5,
    createdAt: Date.now()
  });

  return otp;
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'ehr-backend'
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    cleanupExpired();
    const name = String(req.body.name || '').trim();
    const emailRaw = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!name || !emailRaw || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!emailRegex.test(emailRaw)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 chars and include uppercase, lowercase, number, and special character.'
      });
    }

    const email = normalizeEmail(emailRaw);
    const existingUser = db.data.users.find((user) => user.email === email);
    if (existingUser) {
      const createdAtMs = Date.parse(String(existingUser.createdAt || ''));
      const isRecentSignup =
        Number.isFinite(createdAtMs) &&
        Date.now() - createdAtMs <= RECENT_SIGNUP_WINDOW_MS;

      let emailSent = true;
      try {
        await sendWelcomeEmail({ to: existingUser.email, name: existingUser.name });
      } catch (emailError) {
        emailSent = false;
        console.error('welcome email resend error', emailError);
      }

      if (isRecentSignup) {
        return res.status(200).json({
          message: emailSent
            ? 'Account created. A welcome email has been sent.'
            : 'Account created, but we could not send the welcome email right now.',
          alreadyExists: false,
          emailSent,
          duplicateSignup: true
        });
      }

      return res.status(200).json({
        message: emailSent
             ? 'An account with this email already exists. We sent another welcome email. Please sign in or use Forgot Password.'
             : 'An account with this email already exists. Please sign in or use Forgot Password.',
        alreadyExists: true,
        emailSent
      });
    }

    const nowIso = new Date().toISOString();
    const passwordHash = await hashPassword(password);
    const user = {
      id: createId(),
      name,
      email,
      passwordHash,
      phone: '',
      gender: '',
      dob: '',
      profilePicture: '',
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    db.data.users.push(user);

    await db.write();

    let emailSent = true;
    try {
      await sendWelcomeEmail({ to: user.email, name: user.name });
    } catch (emailError) {
      emailSent = false;
      console.error('welcome email error', emailError);
    }

    return res.status(201).json({
      message: emailSent
        ? 'Account created. A welcome email has been sent.'
        : 'Account created, but we could not send the welcome email right now.',
      alreadyExists: false,
      emailSent
    });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Failed to create account.' });
  }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    cleanupExpired();
    const emailRaw = String(req.body.email || '').trim();
    if (!emailRaw || !emailRegex.test(emailRaw)) {
      return res.status(200).json({ message: 'If your account exists, a verification email has been sent.' });
    }

    const user = findUserByEmail(emailRaw);
    if (!user || user.isActive) {
      return res.status(200).json({ message: 'If your account exists, a verification email has been sent.' });
    }

    const token = createVerificationToken(user.id);
    const verificationUrl = `${config.frontendUrl}/?verifyToken=${token}`;

    await db.write();
    await sendVerificationEmail({ to: user.email, name: user.name, verificationUrl });

    return res.status(200).json({ message: 'If your account exists, a verification email has been sent.' });
  } catch (error) {
    console.error('resend verification error', error);
    return res.status(500).json({ message: 'Unable to resend verification email.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    cleanupExpired();
    const token = String(req.body.token || '').trim();
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const tokenRecord = db.data.verificationTokens.find((item) => item.token === token);
    if (!tokenRecord) {
      return res.status(400).json({ message: 'Verification link is invalid or expired.' });
    }

    const user = db.data.users.find((item) => item.id === tokenRecord.userId);
    if (!user) {
      db.data.verificationTokens = db.data.verificationTokens.filter(
        (item) => item.token !== token
      );
      await db.write();
      return res.status(400).json({ message: 'Verification link is invalid or expired.' });
    }

    user.isActive = true;
    user.updatedAt = new Date().toISOString();

    db.data.verificationTokens = db.data.verificationTokens.filter(
      (item) => item.userId !== user.id
    );

    await db.write();
    return res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('verify email error', error);
    return res.status(500).json({ message: 'Unable to verify email.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    cleanupExpired();

    const emailRaw = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!emailRaw || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = findUserByEmail(emailRaw);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const now = Date.now();

    if (user.lockUntil && user.lockUntil > now) {
      return res.status(423).json({
        message: 'Account locked. Verify OTP to unlock.',
        requiresOtp: true,
        lockUntil: user.lockUntil
      });
    }

    if (user.lockUntil && user.lockUntil <= now) {
      user.lockUntil = null;
      user.failedLoginAttempts = 0;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = minutesFromNow(LOCKOUT_MINUTES);
        const otp = createUnlockOtp(user);
        await db.write();
        await sendOtpEmail({ to: user.email, name: user.name, otp });

        return res.status(423).json({
          message: 'Too many failed attempts. OTP sent to your email.',
          requiresOtp: true,
          lockUntil: user.lockUntil
        });
      }

      await db.write();
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.updatedAt = new Date().toISOString();

    await db.write();

    return res.status(200).json({
      token: issueToken(user),
      user: sanitizeUser(user),
      lockUntil: null,
      loginAttempts: 0
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Unable to sign in.' });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    cleanupExpired();

    const emailRaw = String(req.body.email || '').trim();
    if (!emailRaw || !emailRegex.test(emailRaw)) {
      return res.status(200).json({ message: 'If your account is locked, an OTP has been sent.' });
    }

    const user = findUserByEmail(emailRaw);
    if (!user || !user.lockUntil || user.lockUntil <= Date.now()) {
      return res.status(200).json({ message: 'If your account is locked, an OTP has been sent.' });
    }

    const otp = createUnlockOtp(user);
    await db.write();
    await sendOtpEmail({ to: user.email, name: user.name, otp });

    return res.status(200).json({ message: 'If your account is locked, an OTP has been sent.' });
  } catch (error) {
    console.error('resend otp error', error);
    return res.status(500).json({ message: 'Unable to resend OTP.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    cleanupExpired();

    const emailRaw = String(req.body.email || '').trim();
    const code = String(req.body.code || '').trim();

    if (!emailRaw || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const user = findUserByEmail(emailRaw);
    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const otpRecord = db.data.otpCodes.find(
      (item) => item.userId === user.id && item.purpose === 'unlock'
    );

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP is invalid or expired.' });
    }

    if (otpRecord.code !== code) {
      otpRecord.attemptsLeft = (otpRecord.attemptsLeft || 1) - 1;
      if (otpRecord.attemptsLeft <= 0) {
        db.data.otpCodes = db.data.otpCodes.filter((item) => item.id !== otpRecord.id);
      }
      await db.write();
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    db.data.otpCodes = db.data.otpCodes.filter((item) => item.id !== otpRecord.id);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.updatedAt = new Date().toISOString();

    await db.write();

    return res.status(200).json({
      token: issueToken(user),
      user: sanitizeUser(user),
      lockUntil: null,
      loginAttempts: 0
    });
  } catch (error) {
    console.error('verify otp error', error);
    return res.status(500).json({ message: 'Unable to verify OTP.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    cleanupExpired();

    const emailRaw = String(req.body.email || '').trim();
    if (!emailRaw || !emailRegex.test(emailRaw)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = findUserByEmail(emailRaw);
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email.' });
    }

    const token = createResetToken(user.id);

    await db.write();

    return res.status(200).json({
      message: 'Email confirmed. You can set a new password now.',
      resetToken: token
    });
  } catch (error) {
    console.error('forgot password error', error);
    return res.status(500).json({ message: 'Unable to start password reset.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    cleanupExpired();

    const token = String(req.body.token || '').trim();
    const password = String(req.body.password || '');

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and password are required.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 chars and include uppercase, lowercase, number, and special character.'
      });
    }

    const tokenRecord = db.data.resetTokens.find((item) => item.token === token);
    if (!tokenRecord) {
      return res.status(400).json({ message: 'Reset link is invalid or expired.' });
    }

    const user = db.data.users.find((item) => item.id === tokenRecord.userId);
    if (!user) {
      db.data.resetTokens = db.data.resetTokens.filter((item) => item.id !== tokenRecord.id);
      await db.write();
      return res.status(400).json({ message: 'Reset link is invalid or expired.' });
    }

    user.passwordHash = await hashPassword(password);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.updatedAt = new Date().toISOString();

    db.data.resetTokens = db.data.resetTokens.filter((item) => item.userId !== user.id);

    await db.write();

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('reset password error', error);
    return res.status(500).json({ message: 'Unable to reset password.' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.data.users.find((item) => item.id === req.userId);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({ user: sanitizeUser(user) });
});

app.patch('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const user = db.data.users.find((item) => item.id === req.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const allowedFields = ['name', 'email', 'phone', 'gender', 'dob', 'profilePicture'];

    for (const field of allowedFields) {
      if (req.body[field] === undefined) {
        continue;
      }

      const value = String(req.body[field] ?? '').trim();

      if (field === 'email') {
        if (!value || !emailRegex.test(value)) {
          return res.status(400).json({ message: 'Email is invalid.' });
        }

        const normalized = normalizeEmail(value);
        const existing = db.data.users.find(
          (item) => item.email === normalized && item.id !== user.id
        );
        if (existing) {
          return res.status(409).json({ message: 'Email already in use.' });
        }

        user.email = normalized;
      } else {
        user[field] = value;
      }
    }

    user.updatedAt = new Date().toISOString();
    await db.write();

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('profile update error', error);
    return res.status(500).json({ message: 'Unable to update profile.' });
  }
});

const start = async () => {
  await ensureSeedUser();

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
};

start();
