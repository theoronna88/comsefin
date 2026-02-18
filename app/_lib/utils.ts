import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extrai apenas dígitos e remove zeros à esquerda */
export function extractDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+/, "")
}

/** Converte string de dígitos (centavos) para formato BRL: "123456" → "1.234,56" */
export function formatBRLFromCents(rawDigits: string): string {
  if (!rawDigits) return ""
  const padded = rawDigits.padStart(3, "0")
  const intPart = padded.slice(0, -2)
  const decPart = padded.slice(-2)
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${formatted},${decPart}`
}

/** Converte centavos (string de dígitos) para número decimal: "123456" → 1234.56 */
export function centsToNumber(rawDigits: string): number {
  if (!rawDigits) return 0
  return parseInt(rawDigits, 10) / 100
}

/** Converte número decimal para string de centavos: 1234.56 → "123456" */
export function numberToCents(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return ""
  return String(Math.round(num * 100))
}
