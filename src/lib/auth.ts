import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ||
    "troque-em-producao-vendas-entur-secret-key-muito-longa-aleatoria"
);

export interface SessionPayload {
  userId: number;
  email: string;
  nome: string;
  role: "admin" | "user";
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function assinarSessao(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verificarSessao(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      nome: payload.nome as string,
      role: payload.role as "admin" | "user",
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "vendas_session";
