//src/lib/password.js
import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(rawPassword, hashedPassword) {
  return bcrypt.compare(rawPassword, hashedPassword);
}