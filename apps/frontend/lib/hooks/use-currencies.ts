import { useMemo } from "react"
import countryInfo from "@/data/country_info.json"

/**
 * Shared currency hook for consistent currency options across the application
 * Extracts all currencies from country_info.json where currency_included is "yes"
 * @returns Array of supported currency codes (sorted)
 */
export function useCurrencies(): string[] {
  return useMemo(() => {
    try {
      // Use a set to avoid duplicate currency codes
      const currencySet = new Set<string>()
      
      // Extract currencies from country data
      Object.values(countryInfo).forEach((country: any) => {
        // Only include currencies where "currency_included" is "yes"
        if (country.currency_included?.toLowerCase() === "yes") {
          const shorthand = country.currency_shorthand
          if (shorthand) {
            currencySet.add(shorthand)
          }
        }
      })
      
      // If we found any currencies, sort them; otherwise fall back to defaults
      if (currencySet.size > 0) {
        return Array.from(currencySet).sort()
      } else {
        return ["USD", "EUR", "GBP"]
      }
    } catch (error) {
      console.error("Error loading currencies:", error)
      return ["USD", "EUR", "GBP"]
    }
  }, [])
}

/**
 * Get currency symbol for display purposes
 * @param currencyCode - ISO currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", CHF: "CHF", JPY: "¥", CNY: "¥",
    SEK: "kr", DKK: "kr", NOK: "kr", PLN: "zł", CZK: "Kč", HUF: "Ft", RON: "lei",
    BGN: "лв", HRK: "kn", RSD: "дин", BAM: "KM", MKD: "ден", TRY: "₺", RUB: "₽",
    UAH: "₴", BYN: "Br", INR: "₹", KRW: "₩", THB: "฿", VND: "₫", IDR: "Rp",
    MYR: "RM", SGD: "S$", PHP: "₱", HKD: "HK$", TWD: "NT$", ZAR: "R", EGP: "£",
    NGN: "₦", GHS: "₵", KES: "KSh", UGX: "USh", TZS: "TSh", ETB: "Br", MAD: "DH",
    TND: "DT", DZD: "DA", XOF: "CFA", XAF: "FCFA", BRL: "R$", ARS: "$", CLP: "$",
    COP: "$", PEN: "S/", UYU: "$", MXN: "$", GTQ: "Q", CRC: "₡", PAB: "B/.",
    DOP: "RD$", JMD: "J$", BBD: "Bds$", TTD: "TT$", XCD: "EC$", BSD: "B$",
    ILS: "₪", JOD: "JD", LBP: "ل.ل", SYP: "LS", IQD: "ع.د", KWD: "KD", BHD: "BD",
    QAR: "QR", AED: "AED", OMR: "OMR", SAR: "SR", YER: "﷼", IRR: "﷼"
  }
  return symbols[currencyCode] || currencyCode
}

/**
 * Format currency amount with symbol
 * @param amount - Amount to format
 * @param currencyCode - ISO currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${amount.toLocaleString()}`
}