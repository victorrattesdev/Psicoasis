// Utility functions to handle JSON fields in SQLite
// SQLite stores JSON as String, so we need to convert

export function toJsonString(value: any): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    // Already a string, might be JSON string
    try {
      JSON.parse(value);
      return value;
    } catch {
      // Not valid JSON, stringify it
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value);
}

export function fromJsonString(value: string | null | undefined): any {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function parseJsonField<T = any>(field: string | T | null | undefined): T | null {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return null;
    }
  }
  return field as T;
}




