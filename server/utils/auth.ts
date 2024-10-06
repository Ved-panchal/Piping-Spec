// utils/auth.ts
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}
