import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
  }
  catch (error) {
    console.error(`Error hasheando la contraseña: ${error}`);
    throw new Error('Error hasheando la contraseña');
  }
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  }
  catch (error) {
    console.error(`Error comparando las contraseñas: ${error}`);
    throw new Error('Error comparando las contraseñas');
  }
}
