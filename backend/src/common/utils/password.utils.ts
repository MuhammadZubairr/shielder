/**
 * Password Utilities
 * Centralized password hashing and validation
 * 
 * ⚠️ CRITICAL SECURITY RULE:
 * ALL password operations MUST use these utilities to ensure proper bcrypt hashing.
 * NEVER store plain text passwords or update passwordHash directly without bcrypt.
 */

import bcrypt from 'bcryptjs';

/**
 * Standard bcrypt salt rounds
 * Matches AuthService.SALT_ROUNDS (12 rounds = ~200ms on modern hardware)
 */
export const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * 
 * @param plainPassword - The plain text password to hash
 * @returns Promise<string> - The bcrypt hashed password
 * 
 * @example
 * const hashedPassword = await hashPassword('MySecurePass123!');
 * await prisma.user.update({ data: { passwordHash: hashedPassword } });
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verify a password against a bcrypt hash
 * 
 * @param plainPassword - The plain text password to verify
 * @param hashedPassword - The bcrypt hash to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 * 
 * @example
 * const isValid = await verifyPassword(userInput, user.passwordHash);
 * if (!isValid) throw new UnauthorizedError('Invalid credentials');
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Validate password strength
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - The password to validate
 * @throws Error if password doesn't meet requirements
 */
export function validatePasswordStrength(password: string): void {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long`);
  }

  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter');
  }

  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter');
  }

  if (!hasNumber) {
    throw new Error('Password must contain at least one number');
  }

  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character');
  }
}

/**
 * Generate a random secure password
 * Useful for password resets or temporary passwords
 * 
 * @param length - Length of password (default: 16)
 * @returns A random password meeting all strength requirements
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;

  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
