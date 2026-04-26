// Deprecated: JSON fields are now native Json/JSONB in PostgreSQL.
// Prisma handles serialization automatically — these functions are no longer used.

export function toJsonString(value: any): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try { JSON.parse(value); return value; } catch { return JSON.stringify(value); }
  }
  return JSON.stringify(value);
}

export function fromJsonString(value: string | null | undefined): any {
  if (!value) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

export function parseJsonField<T = any>(field: string | T | null | undefined): T | null {
  if (!field) return null;
  if (typeof field === 'string') {
    try { return JSON.parse(field) as T; } catch { return null; }
  }
  return field as T;
}
