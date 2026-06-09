import { NextRequest, NextResponse } from "next/server";

// Rate limiter simples em memória (por instância). Adequado ao deploy de
// container único no Coolify. Para múltiplas réplicas, migrar para
// @upstash/ratelimit + Redis (já disponível no stack) ou rate limit no Traefik.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Limpeza periódica para não vazar memória.
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();
function maybeCleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitOptions = {
  /** Identificador do grupo de rotas (ex.: "auth-login"). */
  id: string;
  /** Máximo de requisições na janela. */
  limit: number;
  /** Tamanho da janela em ms. */
  windowMs: number;
};

/**
 * Aplica rate limiting por IP. Retorna uma resposta 429 se exceder o limite,
 * ou null se a requisição pode prosseguir.
 *
 *   const limited = rateLimit(req, { id: "auth-login", limit: 10, windowMs: 60_000 });
 *   if (limited) return limited;
 */
export function rateLimit(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  maybeCleanup(now);

  const ip = getClientIp(req);
  const key = `${options.id}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > options.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  return null;
}
