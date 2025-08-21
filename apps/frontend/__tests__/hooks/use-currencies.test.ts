import { renderHook } from '@testing-library/react'
import { useCurrencies, getCurrencySymbol, formatCurrency } from '@/lib/hooks/use-currencies'

describe('useCurrencies', () => {
  it('should return expected currency codes', () => {
    const { result } = renderHook(() => useCurrencies())
    
    expect(result.current).toEqual([
      "USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"
    ])
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
    expect(formatCurrency(1500.50, 'EUR')).toBe('€1,501') // Note: toLocaleString rounds
    expect(formatCurrency(999, 'GBP')).toBe('£999')
  })

  it('should handle unknown currencies', () => {
    expect(formatCurrency(1000, 'XYZ')).toBe('XYZ1,000')
  })
})
