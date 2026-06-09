import { NextRequest, NextResponse } from "next/server";
import { getBearerTokenFromRequest, verifyUserToken, type VerifiedPayload } from "@/lib/jwt";

const unauthorized = () =>
  NextResponse.json({ error: "Não autenticado" }, { status: 401 });
const forbidden = () =>
  NextResponse.json({ error: "Acesso negado" }, { status: 403 });

/**
 * Verifica e decodifica o token Bearer da requisição.
 * Retorna o payload verificado ou null (token ausente/inválido/expirado).
 */
export const getAuthPayload = async (
  req: NextRequest
): Promise<VerifiedPayload | null> => {
  const token = getBearerTokenFromRequest(req);
  if (!token) return null;
  try {
    return await verifyUserToken(token);
  } catch {
    return null;
  }
};

/**
 * Exige um usuário autenticado. Use assim:
 *   const auth = await requireAuth(req);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth é o payload verificado
 */
export const requireAuth = async (
  req: NextRequest
): Promise<VerifiedPayload | NextResponse> => {
  const payload = await getAuthPayload(req);
  if (!payload) return unauthorized();
  return payload;
};

/**
 * Exige um usuário ADMIN, retornando o payload. Use assim:
 *   const auth = await requireAdminPayload(req);
 *   if (auth instanceof NextResponse) return auth;
 */
export const requireAdminPayload = async (
  req: NextRequest
): Promise<VerifiedPayload | NextResponse> => {
  const payload = await getAuthPayload(req);
  if (!payload) return unauthorized();
  if (payload.role !== "ADMIN") return forbidden();
  return payload;
};

/**
 * Guard de admin no formato legado (retorna NextResponse de erro ou null em caso de sucesso).
 * Mantido para as rotas /api/admin/* que já usam este padrão.
 */
export const requireAdmin = async (
  req: NextRequest
): Promise<NextResponse | null> => {
  const auth = await requireAdminPayload(req);
  return auth instanceof NextResponse ? auth : null;
};
