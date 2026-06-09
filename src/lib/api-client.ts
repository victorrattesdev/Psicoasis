"use client";

// Helpers para o cliente anexar o token JWT às requisições autenticadas.
// O servidor deriva a identidade do token — nunca confie em IDs do body.

const TOKEN_KEY = "psicoasis_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/**
 * Cabeçalhos de autenticação (Bearer). Mescle com os seus:
 *   headers: { ...authHeaders(), "Content-Type": "application/json" }
 */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
