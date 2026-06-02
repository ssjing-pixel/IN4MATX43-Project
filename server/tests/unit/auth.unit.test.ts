import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret_key';

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

function generateToken(userId: number, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): { userId: number; username: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
}

describe('Auth unit tests', () => {
  const password = 'mySecretPassword!';
  let hash: string;

  beforeAll(() => {
    hash = hashPassword(password);
  });

  test('hashPassword produces a hash different from the original', () => {
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  test('comparePassword returns true for correct password', () => {
    expect(comparePassword(password, hash)).toBe(true);
  });

  test('comparePassword returns false for wrong password', () => {
    expect(comparePassword('wrongPassword', hash)).toBe(false);
  });

  test('generateToken returns a string containing two dots (JWT format)', () => {
    const token = generateToken(42, 'testuser');
    expect(typeof token).toBe('string');
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  test('verifyToken returns the payload with correct userId', () => {
    const token = generateToken(42, 'testuser');
    const payload = verifyToken(token);
    expect(payload.userId).toBe(42);
    expect(payload.username).toBe('testuser');
  });
});
