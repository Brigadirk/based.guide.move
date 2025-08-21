import { renderHook } from '@testing-library/react'
import { useCurrencies, getCurrencySymbol, formatCurrency } from '../helpers/use-currencies'

describe('useCurrencies', () => {
  it('should return currency codes from country data', () => {
    const { result } = renderHook(() => useCurrencies())
    
    // Should return an array of currency codes
    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current.length).toBeGreaterThan(0)
    
    // Should include major currencies
    expect(result.current).toContain("USD")
    expect(result.current).toContain("EUR")
    expect(result.current).toContain("GBP")
    
    // Should be sorted alphabetically
    const sorted = [...result.current].sort()
    expect(result.current).toEqual(sorted)
  })

  it('should return the same reference on multiple calls', () => {
    const { result, rerender } = renderHook(() => useCurrencies())
    const firstResult = result.current
    
    rerender()
    
    expect(result.current).toBe(firstResult)
  })
})

describe('getCurrencySymbol', () => {
  it('should return correct symbols for known currencies', () => {
    expect(getCurrencySymbol('USD')).toBe('$')
    expect(getCurrencySymbol('EUR')).toBe('€')
    expect(getCurrencySymbol('GBP')).toBe('£')
    expect(getCurrencySymbol('JPY')).toBe('¥')
  })

  it('should return currency code for unknown currencies', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ')
  })
})

describe('formatCurrency', () => {
  it('should format currency with symbol and thousands separator', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000')
    expect(formatCurrency(1500.5, 'EUR')).toBe('€1,500.5') // toLocaleString preserves decimals
    expect(formatCurrency(999, 'GBP')).toBe('£999')
  })

  it('should handle unknown currencies', () => {
    expect(formatCurrency(1000, 'XYZ')).toBe('XYZ1,000')
  })
})
