import path from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/db.json');

const defaultData = {
  users: [],
  verificationTokens: [],
  otpCodes: [],
  resetTokens: []
};

export const db = await JSONFilePreset(dbPath, defaultData);

export const ensureSeedUser = async () => {
  const exists = db.data.users.find((user) => user.email === 'sarah@example.com');
  if (exists) {
    return;
  }

  const passwordHash = await bcrypt.hash('Test@1234', 10);
  db.data.users.push({
    id: 'seed-user-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    passwordHash,
    phone: '+1 (555) 123-4567',
    gender: 'Female',
    dob: '1990-05-15',
    profilePicture: '',
    isActive: true,
    failedLoginAttempts: 0,
    lockUntil: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await db.write();
};
