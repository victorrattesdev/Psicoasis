import sanitizeHtmlLib from "sanitize-html";

// Utilitários de segurança para validação de entrada e sanitização de conteúdo.

// Limites de tamanho (em caracteres) para evitar abuso de armazenamento/tráfego.
// O conteúdo do blog pode conter imagens base64 inline enquanto não houver
// object storage; o teto evita o cenário do incidente (payloads sem limite).
export const MAX_TITLE_LENGTH = 200;
export const MAX_EXCERPT_LENGTH = 500;
export const MAX_SHORT_FIELD_LENGTH = 300;
export const MAX_META_FIELD_LENGTH = 400;
export const MAX_CONTENT_LENGTH = 3_000_000; // ~3MB de HTML
export const MAX_IMAGE_URL_LENGTH = 2_000_000; // ~2MB (data: URI tolerado até migrar p/ storage)

// Permite data:image base64 enquanto não há object storage configurado.
// Quando migrar para storage, defina ALLOW_DATA_URI_IMAGES=false para exigir https.
const allowDataImages = process.env.ALLOW_DATA_URI_IMAGES !== "false";

/**
 * Valida que um valor de imagem é seguro: ou uma URL https, ou (se permitido)
 * um data:image dentro do teto de tamanho. Strings vazias/nulas são aceitas
 * (campo opcional). Qualquer outro esquema (javascript:, http:, etc.) é rejeitado.
 */
export function isSafeImageValue(value: string | null | undefined): boolean {
  if (!value) return true;
  const v = value.trim();
  if (v.length > MAX_IMAGE_URL_LENGTH) return false;
  if (/^https:\/\//i.test(v)) return true;
  if (allowDataImages && /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i.test(v)) {
    return true;
  }
  return false;
}

/** Verifica se uma string excede o limite informado (após trim). */
export function exceedsLength(value: unknown, max: number): boolean {
  return typeof value === "string" && value.trim().length > max;
}

/** Validação simples de formato de e-mail. */
export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ---------------------------------------------------------------------------
// Sanitização de HTML — usa sanitize-html (htmlparser2, sem jsdom), sólido no
// runtime Node do Next. Allowlist restrita à saída do editor TipTap. Remove
// scripts, handlers on*, javascript:/vbscript:, e esquemas de URL inseguros.
// ---------------------------------------------------------------------------

const sanitizeOptions: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "del",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote", "code", "pre", "hr",
    "a", "img", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "style"],
    span: ["style"],
    "*": [],
  },
  // Esquemas permitidos para href.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    // Imagens podem ser https ou data:image (base64) enquanto não há storage.
    img: allowDataImages ? ["http", "https", "data"] : ["http", "https"],
  },
  allowProtocolRelative: false,
  // Reforça segurança em links externos.
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
  },
  // Remove estilos perigosos; mantém formatação simples.
  allowedStyles: {
    "*": {
      "text-align": [/^(left|right|center|justify)$/],
      "max-width": [/^\d+(?:px|%)$/],
      height: [/^auto$/],
      display: [/^(block|inline|inline-block)$/],
      margin: [/^[\d\s a-z%]+$/],
    },
  },
};

/**
 * Sanitiza HTML de conteúdo gerado por usuário com sanitize-html.
 * Mantém apenas tags/atributos da allowlist; remove XSS conhecido e desconhecido.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return sanitizeHtmlLib(input, sanitizeOptions);
}
