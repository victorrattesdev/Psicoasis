import { SignJWT } from "jose";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET ?? "";
  if (secret) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("dev-secret-change-me");
  }
  throw new Error("JWT_SECRET is not set");
};

export type TokenPayload = {
  sub: string;
  email: string;
  name: string;
  type: "paciente" | "profissional";
  role: "USER" | "ADMIN";
};

export type VerifiedPayload = TokenPayload & { exp?: number; iat?: number };

// Expiração da sessão. Menor = menor janela para um token vazado, já que o
// logout só limpa o cliente (sem blacklist). Configurável via JWT_EXPIRES.
const TOKEN_EXPIRATION = process.env.JWT_EXPIRES || "2d";

export const signUserToken = async (payload: TokenPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getJwtSecret());
};

export const verifyUserToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  return payload as VerifiedPayload;
};

export const getBearerTokenFromRequest = (req: NextRequest): string | null => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
};
