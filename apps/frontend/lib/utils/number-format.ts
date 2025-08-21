export function formatNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value
  if (isNaN(num)) return ""
  return num.toLocaleString("en-US")
}

export function parseNumber(display: string): number | null {
  const cleaned = display.replace(/[^0-9.]/g, "")
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
} 