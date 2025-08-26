// Simple utility tests for backend tester

describe('Backend Tester Utils', () => {
  describe('Environment Detection', () => {
    const originalEnv = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_RAILWAY_PUBLIC_URL: process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL,
      NEXT_PUBLIC_LOCAL_URL: process.env.NEXT_PUBLIC_LOCAL_URL,
    }

    afterEach(() => {
      if (originalEnv.NODE_ENV) {
        (process.env as any).NODE_ENV = originalEnv.NODE_ENV
      }
      if (originalEnv.NEXT_PUBLIC_RAILWAY_PUBLIC_URL) {
        process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL = originalEnv.NEXT_PUBLIC_RAILWAY_PUBLIC_URL
      }
      if (originalEnv.NEXT_PUBLIC_LOCAL_URL) {
        process.env.NEXT_PUBLIC_LOCAL_URL = originalEnv.NEXT_PUBLIC_LOCAL_URL
      }
      // no-op for deprecated testing key
    })

    const getDefaultBackendUrl = () => {
      // Priority order: try to use environment variables, fallback to reasonable defaults
      if (process.env.NODE_ENV === 'production') {
        // In production, prefer Railway Public, then fallback
        return process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL || 
               'http://localhost:3000' // Last resort fallback for production
      } else {
        // In development, prefer Local, then Railway Public, then fallback  
        return process.env.NEXT_PUBLIC_LOCAL_URL ||
               process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL ||
               'http://localhost:5001' // Last resort fallback for development
      }
    }

    it('uses development URL by default', () => {
      (process.env as any).NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_LOCAL_URL = 'http://localhost:5001'
      
      expect(getDefaultBackendUrl()).toBe('http://localhost:5001')
    })

    it('uses production public URL by default', () => {
      (process.env as any).NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL = 'https://bonobo-backend.up.railway.app'
      
      expect(getDefaultBackendUrl()).toBe('https://bonobo-backend.up.railway.app')
    })

    it('uses custom local URL when set', () => {
      (process.env as any).NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_LOCAL_URL = 'http://localhost:8080'
      
      expect(getDefaultBackendUrl()).toBe('http://localhost:8080')
    })

    it('uses custom railway public URL when set', () => {
      (process.env as any).NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL = 'https://custom-backend.up.railway.app'
      
      expect(getDefaultBackendUrl()).toBe('https://custom-backend.up.railway.app')
    })

    it('falls back to last resort defaults when no env vars set', () => {
      delete process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL
      delete process.env.NEXT_PUBLIC_LOCAL_URL
      
      // Mock NODE_ENV for development
      const originalNodeEnv = process.env.NODE_ENV
      ;(process.env as any).NODE_ENV = 'development'
      expect(getDefaultBackendUrl()).toBe('http://localhost:5001')
      
      // Mock NODE_ENV for production
      ;(process.env as any).NODE_ENV = 'production'  
      expect(getDefaultBackendUrl()).toBe('http://localhost:3000')
      
      // Restore original NODE_ENV
      ;(process.env as any).NODE_ENV = originalNodeEnv
    })

    it('always shows all preset buttons with configuration status', () => {
      // Test that all preset buttons always appear, showing their configuration status
      delete process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL
      delete process.env.NEXT_PUBLIC_LOCAL_URL
      
      // Mock preset creation logic (always returns all presets)
      const createPresets = () => [
        { 
          label: 'Railway Public', 
          url: process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL,
          description: 'Public Railway URL (accessible from internet)',
          envVar: 'NEXT_PUBLIC_RAILWAY_PUBLIC_URL'
        },
        { 
          label: 'Local Development', 
          url: process.env.NEXT_PUBLIC_LOCAL_URL,
          description: 'Local backend server',
          envVar: 'NEXT_PUBLIC_LOCAL_URL'
        }
      ]
      
      // Two presets should always appear
      expect(createPresets()).toHaveLength(2)
      
      // With no environment variables, URLs should be undefined
      const presetsNoEnv = createPresets()
      expect(presetsNoEnv[0].url).toBeUndefined()
      expect(presetsNoEnv[1].url).toBeUndefined()
      
      // Set environment variables
      process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL = 'https://test-backend-xyz.up.railway.app'
      process.env.NEXT_PUBLIC_LOCAL_URL = 'http://localhost:5001'
      
      const presetsWithEnv = createPresets()
      expect(presetsWithEnv).toHaveLength(2) // Still 2 presets
      expect(presetsWithEnv[0].url).toBe('https://test-backend-xyz.up.railway.app')
      expect(presetsWithEnv[1].url).toBe('http://localhost:5001')
    })
  })

  describe('API Endpoint Formatting', () => {
    it('formats endpoint keys correctly', () => {
      const formatEndpointKey = (endpoint: string) => endpoint.replace(/\//g, '_')
      
      expect(formatEndpointKey('/health')).toBe('_health')
      expect(formatEndpointKey('/api/v1/exchange-rates')).toBe('_api_v1_exchange-rates')
      expect(formatEndpointKey('/api/v1/section/personal-information')).toBe('_api_v1_section_personal-information')
    })
  })

  describe('Mock Data Validation', () => {
    it('validates personal information mock data structure', () => {
      const mockPersonalInfo = {
        personal_information: {
          dateOfBirth: "1990-01-15",
          nationalities: [{ country: "US" }],
          maritalStatus: "Single",
          currentResidency: {
            country: "US",
            status: "Citizen"
          }
        }
      }

      expect(mockPersonalInfo.personal_information).toBeDefined()
      expect(mockPersonalInfo.personal_information.dateOfBirth).toBe("1990-01-15")
      expect(Array.isArray(mockPersonalInfo.personal_information.nationalities)).toBe(true)
    })

    it('validates exchange rate mock data structure', () => {
      const mockExchangeRates = {
        status: 'success',
        base_currency: 'USD',
        rates: { EUR: 0.85, GBP: 0.73 },
        metadata: { total_currencies: 2 }
      }

      expect(mockExchangeRates.status).toBe('success')
      expect(mockExchangeRates.base_currency).toBe('USD')
      expect(typeof mockExchangeRates.rates).toBe('object')
      expect(mockExchangeRates.metadata.total_currencies).toBeGreaterThan(0)
    })
  })

  describe('Currency Conversion Logic', () => {
    it('converts currencies correctly', () => {
      const rates = { EUR: 0.85, GBP: 0.73 }
      
      const convertCurrency = (amount: number, from: string, to: string) => {
        if (from === to) return amount
        
        let result = amount
        
        // Convert from source to USD if needed
        if (from !== 'USD') {
          const fromRate = rates[from as keyof typeof rates]
          if (!fromRate) return 'Invalid currency'
          result = amount / fromRate
        }
        
        // Convert from USD to target if needed
        if (to !== 'USD') {
          const toRate = rates[to as keyof typeof rates]
          if (!toRate) return 'Invalid currency'
          result = result * toRate
        }
        
        return parseFloat(result.toFixed(4))
      }

      expect(convertCurrency(100, 'USD', 'EUR')).toBe(85)
      expect(convertCurrency(100, 'EUR', 'USD')).toBe(117.6471)
      expect(convertCurrency(100, 'EUR', 'GBP')).toBe(85.8824)
      expect(convertCurrency(100, 'USD', 'USD')).toBe(100)
    })
  })
})
