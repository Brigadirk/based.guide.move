import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BackendTester from '@/app/page'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Backend Tester', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders the main heading', () => {
    render(<BackendTester />)
    expect(screen.getByText('🧪 Backend API Tester - BasedGuide')).toBeInTheDocument()
  })

  it('shows environment info', () => {
    render(<BackendTester />)
    expect(screen.getByText(/Backend URL:/)).toBeInTheDocument()
    expect(screen.getByText(/Environment:/)).toBeInTheDocument()
  })

  it('renders health check button', () => {
    render(<BackendTester />)
    expect(screen.getByText('GET Health Check')).toBeInTheDocument()
  })

  it('renders exchange rate section', () => {
    render(<BackendTester />)
    expect(screen.getByText('Exchange Rate Endpoints')).toBeInTheDocument()
    expect(screen.getByText('GET Get Exchange Rates')).toBeInTheDocument()
    expect(screen.getByText('POST Refresh Exchange Rates')).toBeInTheDocument()
  })

  it('shows currency converter when exchange rates not loaded', () => {
    render(<BackendTester />)
    expect(screen.getByText('Currency Converter')).toBeInTheDocument()
    expect(screen.getByText('Please fetch exchange rates first to use the converter')).toBeInTheDocument()
  })

  it('calls API when health check button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy' })
    } as Response)

    render(<BackendTester />)
    
    const healthButton = screen.getByText('GET Health Check')
    fireEvent.click(healthButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })

  it('calls exchange rates API when button is clicked', async () => {
    const mockRates = {
      status: 'success',
      base_currency: 'USD',
      rates: { EUR: 0.85, GBP: 0.73 },
      metadata: { total_currencies: 2, last_updated: '2025-01-22T12:00:00' }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRates
    } as Response)

    render(<BackendTester />)
    
    const exchangeRatesButton = screen.getByText('GET Get Exchange Rates')
    fireEvent.click(exchangeRatesButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/exchange-rates'),
        expect.objectContaining({
          method: 'GET'
        })
      )
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<BackendTester />)
    
    const healthButton = screen.getByText('GET Health Check')
    fireEvent.click(healthButton)

    await waitFor(() => {
      expect(screen.getByText(/ERROR/)).toBeInTheDocument()
    })
  })

  it('displays successful API responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 'healthy', message: 'All good' })
    } as Response)

    render(<BackendTester />)
    
    const healthButton = screen.getByText('GET Health Check')
    fireEvent.click(healthButton)

    await waitFor(() => {
      expect(screen.getByText(/SUCCESS.*200/)).toBeInTheDocument()
    })
  })
})
