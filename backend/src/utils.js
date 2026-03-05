import { randomBytes, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 30;
export const OTP_EXPIRY_MINUTES = 10;
export const VERIFICATION_TOKEN_HOURS = 24;
export const RESET_TOKEN_HOURS = 1;

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
};

export const createId = () => randomUUID();

export const createToken = () => randomBytes(32).toString('hex');

export const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const minutesFromNow = (minutes) => Date.now() + minutes * 60 * 1000;

export const hoursFromNow = (hours) => Date.now() + hours * 60 * 60 * 1000;

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  gender: user.gender || '',
  dob: user.dob || '',
  profilePicture: user.profilePicture || '',
  isActive: Boolean(user.isActive)
});
