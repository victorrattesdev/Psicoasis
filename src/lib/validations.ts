// Validation utilities

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email é obrigatório' }
  }
  
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Email inválido' }
  }
  
  return { valid: true }
}

export function validateName(name: string | undefined | null): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' }
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' }
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: 'Nome deve ter no máximo 100 caracteres' }
  }
  
  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Senha é obrigatória' }
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' }
  }
  
  return { valid: true }
}

export function validateCRP(crp: string | undefined | null): { valid: boolean; error?: string } {
  if (!crp || crp.trim().length === 0) {
    return { valid: false, error: 'CRP é obrigatório para psicólogos' }
  }
  
  // Basic CRP format validation (CRP XX/XXXXXX)
  const crpRegex = /^CRP\s\d{2}\/\d{6,7}$/i
  if (!crpRegex.test(crp.trim())) {
    return { valid: false, error: 'Formato de CRP inválido. Use o formato: CRP XX/XXXXXX' }
  }
  
  return { valid: true }
}

export function sanitizeString(input: string | undefined | null): string | null {
  if (!input) return null
  return input.trim() || null
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}




