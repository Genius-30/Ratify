import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, hashedPassword);
}
