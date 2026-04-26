import { NextRequest, NextResponse } from "next/server";
import { getBearerTokenFromRequest, verifyUserToken } from "@/lib/jwt";

export const requireAdmin = async (req: NextRequest): Promise<NextResponse | null> => {
  const token = getBearerTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const payload = await verifyUserToken(token);
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return null;
  } catch {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
  }
};
