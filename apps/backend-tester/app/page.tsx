'use client'

import { useState, useEffect } from 'react'

// Mock data for testing each endpoint
const mockData = {
  health: null,
  ping: null,
  personalInformation: {
    personal_information: {
      dateOfBirth: "1990-01-15",
      nationalities: [{ country: "US" }],
      maritalStatus: "Single",
      currentResidency: {
        country: "US",
        status: "Citizen"
      }
    }
  },
  education: {
    education: {
      highestDegree: "Bachelor's",
      fieldOfStudy: "Computer Science",
      institution: "MIT",
      graduationYear: 2015,
      certifications: ["AWS Certified"],
      skills: ["JavaScript", "Python"]
    }
  },
  residencyIntentions: {
    residency_intentions: {
      destinationCountry: { country: "Portugal" },
      moveType: "Permanent",
      timeframe: "Within 1 year"
    }
  },
  finance: {
    finance: {
      income: [
        {
          source: "Employment",
          amount: 80000,
          currency: "USD",
          frequency: "Annual"
        }
      ],
      assets: [
        {
          type: "Savings",
          amount: 50000,
          currency: "USD"
        }
      ]
    },
    destination_country: "Portugal"
  },
  socialSecurity: {
    social_security_and_pensions: {
      currentContributions: [
        {
          country: "US",
          system: "Social Security",
          yearsContributed: 10
        }
      ]
    },
    destination_country: "Portugal"
  },
  taxDeductions: {
    tax_deductions_and_credits: {
      deductions: [
        {
          type: "Mortgage Interest",
          amount: 12000,
          currency: "USD"
        }
      ]
    },
    destination_country: "Portugal"
  },
  futureFinancialPlans: {
    future_financial_plans: {
      retirementGoals: {
        targetAge: 65,
        expectedAmount: 1000000,
        currency: "USD"
      }
    },
    destination_country: "Portugal"
  },
  additionalInformation: {
    additional_information: {
      notes: "Looking for tax optimization",
      specialCircumstances: "Digital nomad"
    }
  },
  summary: {
    profile_data: {
      personal: { age: 33, nationality: "US" },
      destination: "Portugal",
      finances: { income: 80000 }
    }
  },
  taxAdvice: {
    personalInformation: { age: 33, nationality: "US" },
    destinationCountry: "Portugal",
    income: 80000,
    assets: 50000
  },
  customPrompt: {
    prompt: "What are the tax implications of moving from US to Portugal?",
    model: "sonar-deep-research"
  },
  generateFullStory: {
    profile_data: {
      personal: { age: 33, nationality: "US" },
      destination: "Portugal"
    }
  },
  perplexityAnalysis: {
    full_story: "A 33-year-old US citizen looking to move to Portugal with $80k income and $50k in savings.",
    prompt: "Analyze tax implications and visa requirements",
    model: "sonar-deep-research"
  },
  exchangeRates: null,
  exchangeRatesRefresh: null
}

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  status?: number
}

export default function BackendTester() {
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [editableData, setEditableData] = useState(mockData)
  const [converterAmount, setConverterAmount] = useState('100')
  const [converterFrom, setConverterFrom] = useState('USD')
  const [converterTo, setConverterTo] = useState('EUR')
  
  // Backend URL management
  const [backendUrl, setBackendUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('backend-tester-url') || getDefaultBackendUrl()
    }
    return getDefaultBackendUrl()
  })
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')
  
  // Test connection on initial load
  useEffect(() => {
    testConnection().then(isConnected => setConnectionStatus(isConnected ? 'connected' : 'error'))
  }, [backendUrl])
  
  function getDefaultBackendUrl() {
    return process.env.NODE_ENV === 'production' 
      ? 'http://bonobo-backend.railway.internal'
      : 'http://localhost:5001'
  }

  // Test backend connection
  const testConnection = async (url: string = backendUrl) => {
    try {
      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Save backend URL to localStorage when it changes
  const updateBackendUrl = async (newUrl: string) => {
    setBackendUrl(newUrl)
    if (typeof window !== 'undefined') {
      localStorage.setItem('backend-tester-url', newUrl)
    }
    
    // Test connection to new URL
    setConnectionStatus('unknown')
    const isConnected = await testConnection(newUrl)
    setConnectionStatus(isConnected ? 'connected' : 'error')
  }

  const callApi = async (endpoint: string, method: 'GET' | 'POST' = 'POST', data?: any) => {
    const key = endpoint.replace('/', '_')
    setLoading(prev => ({ ...prev, [key]: true }))
    
    try {
      console.log(`Calling ${method} ${backendUrl}${endpoint}`)
      console.log('Data:', data)
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      if (data && method === 'POST') {
        options.body = JSON.stringify(data)
      }
      
      const response = await fetch(`${backendUrl}${endpoint}`, options)
      const result = await response.json()
      
      setResponses(prev => ({
        ...prev,
        [key]: {
          success: response.ok,
          data: result,
          status: response.status
        }
      }))
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error)
      setResponses(prev => ({
        ...prev,
        [key]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const updateMockData = (key: string, value: string) => {
    try {
      const parsed = JSON.parse(value)
      setEditableData(prev => ({ ...prev, [key]: parsed }))
    } catch (error) {
      console.error('Invalid JSON:', error)
    }
  }

  const ExchangeRateDisplay = ({ rates }: { rates: any }) => {
    if (!rates || !rates.rates) return null
    
    // Show first 10 rates and total count
    const rateEntries = Object.entries(rates.rates).slice(0, 10)
    const totalRates = Object.keys(rates.rates).length
    
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Exchange Rates (USD Base) - Showing {rateEntries.length} of {totalRates} currencies
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          Last Updated: {rates.metadata?.last_updated || 'Unknown'} 
          ({rates.metadata?.file_age_hours ? `${rates.metadata.file_age_hours}h ago` : 'Unknown age'})
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          {rateEntries.map(([currency, rate]) => (
            <div key={currency} style={{ 
              padding: '4px 8px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              fontSize: '11px',
              border: '1px solid #e9ecef'
            }}>
              <strong>{currency}</strong>: {typeof rate === 'number' ? rate.toFixed(4) : rate}
            </div>
          ))}
        </div>
        {totalRates > 10 && (
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
            ...and {totalRates - 10} more currencies (see full response below)
          </div>
        )}
      </div>
    )
  }

  const TestButton = ({ 
    endpoint, 
    method = 'POST', 
    dataKey, 
    label 
  }: { 
    endpoint: string
    method?: 'GET' | 'POST'
    dataKey?: string
    label: string 
  }) => {
    const key = endpoint.replace('/', '_')
    const isLoading = loading[key]
    const response = responses[key]
    const data = dataKey ? editableData[dataKey as keyof typeof editableData] : undefined
    const isExchangeRate = endpoint.includes('exchange-rates') && !endpoint.includes('refresh')

    return (
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => callApi(endpoint, method, data)}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              minWidth: '120px'
            }}
          >
            {isLoading ? 'Loading...' : `${method} ${label}`}
          </button>
          <code style={{ fontSize: '12px', color: '#666' }}>
            {method} {endpoint}
          </code>
        </div>
        
        {dataKey && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Request Data (editable):
            </label>
            <textarea
              value={JSON.stringify(data, null, 2)}
              onChange={(e) => updateMockData(dataKey, e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        )}
        
        {response && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ 
              marginBottom: '8px',
              color: response.success ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              Status: {response.success ? 'SUCCESS' : 'ERROR'} 
              {response.status && ` (${response.status})`}
            </div>
            
            {/* Special display for exchange rates */}
            {isExchangeRate && response.success && response.data && (
              <ExchangeRateDisplay rates={response.data} />
            )}
            
            <details>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#666'
              }}>
                {isExchangeRate ? 'Full JSON Response' : 'Response Details'}
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '11px',
                maxHeight: '300px',
                marginTop: '8px'
              }}>
                {response.error || JSON.stringify(response.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    )
  }

  const CurrencyConverter = () => {
    const exchangeRateResponse = responses['api_v1_exchange-rates']
    if (!exchangeRateResponse?.success || !exchangeRateResponse.data?.rates) {
      return (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Currency Converter</div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            Please fetch exchange rates first to use the converter
          </div>
        </div>
      )
    }

    const rates = exchangeRateResponse.data.rates
    const currencies = Object.keys(rates).sort()
    
    // Add USD to the list since it's the base currency
    if (!currencies.includes('USD')) {
      currencies.unshift('USD')
    }
    
    const convertCurrency = () => {
      const amount = parseFloat(converterAmount) || 0
      if (converterFrom === converterTo) return amount
      
      let result = amount
      
      // Convert from source to USD if needed
      if (converterFrom !== 'USD') {
        const fromRate = rates[converterFrom]
        if (!fromRate) return 'Invalid currency'
        result = amount / fromRate
      }
      
      // Convert from USD to target if needed
      if (converterTo !== 'USD') {
        const toRate = rates[converterTo]
        if (!toRate) return 'Invalid currency'
        result = result * toRate
      }
      
      return result.toFixed(4)
    }

    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#d1ecf1', 
        border: '1px solid #bee5eb', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Currency Converter</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            value={converterAmount}
            onChange={(e) => setConverterAmount(e.target.value)}
            style={{ padding: '6px', width: '100px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Amount"
          />
          <select
            value={converterFrom}
            onChange={(e) => setConverterFrom(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <span style={{ fontWeight: 'bold' }}>→</span>
          <select
            value={converterTo}
            onChange={(e) => setConverterTo(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <span style={{ fontWeight: 'bold', color: '#0c5460' }}>
            = {convertCurrency()} {converterTo}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#0c5460', marginTop: '8px' }}>
          Using exchange rates from: {exchangeRateResponse.data.metadata?.last_updated || 'Unknown'}
        </div>
      </div>
    )
  }

  const BackendUrlSwitcher = () => {
    const [customUrl, setCustomUrl] = useState('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    
    const presetUrls = [
      { 
        label: 'Railway Internal', 
        url: 'http://bonobo-backend.railway.internal',
        description: 'Internal Railway network (secure)'
      },
      { 
        label: 'Railway Public', 
        url: 'https://backend-staging-71d3.up.railway.app',
        description: 'Public Railway URL (if available)'
      },
      { 
        label: 'Local Development', 
        url: 'http://localhost:5001',
        description: 'Local backend server'
      }
    ]
    
    const handlePresetSelect = async (url: string) => {
      await updateBackendUrl(url)
      setShowCustomInput(false)
    }
    
    const handleCustomSubmit = async () => {
      if (customUrl.trim()) {
        await updateBackendUrl(customUrl.trim())
        setShowCustomInput(false)
        setCustomUrl('')
      }
    }
    
    return (
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#0c4a6e' }}>
          🔗 Backend URL Configuration
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Current: <strong>{backendUrl}</strong></span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              backgroundColor: connectionStatus === 'connected' ? '#dcfce7' : connectionStatus === 'error' ? '#fecaca' : '#f3f4f6',
              color: connectionStatus === 'connected' ? '#166534' : connectionStatus === 'error' ? '#dc2626' : '#6b7280'
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#16a34a' : connectionStatus === 'error' ? '#dc2626' : '#9ca3af'
              }}></span>
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Unknown'}
            </span>
            <button
              onClick={() => testConnection().then(isConnected => setConnectionStatus(isConnected ? 'connected' : 'error'))}
              style={{
                padding: '2px 6px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Test
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {presetUrls.map((preset) => (
              <button
                key={preset.url}
                onClick={() => handlePresetSelect(preset.url)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: backendUrl === preset.url ? '#0ea5e9' : 'white',
                  color: backendUrl === preset.url ? 'white' : '#0c4a6e',
                  border: '1px solid #0ea5e9',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: backendUrl === preset.url ? 'bold' : 'normal'
                }}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
            
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#0c4a6e',
                border: '1px solid #0ea5e9',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Custom URL
            </button>
          </div>
          
          {showCustomInput && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-backend-url.com"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #0ea5e9',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
              />
              <button
                onClick={handleCustomSubmit}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Set
              </button>
            </div>
          )}
        </div>
        
        <div style={{ fontSize: '11px', color: '#0c4a6e', opacity: 0.8 }}>
          💡 Switch between internal Railway network (secure) and public URLs for testing
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>
        🧪 Backend API Tester - BasedGuide
      </h1>
      
      <BackendUrlSwitcher />
      
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Environment Info:</h3>
        <p style={{ margin: 0, fontFamily: 'monospace' }}>
          Active Backend: <strong>{backendUrl}</strong><br/>
          Environment: <strong>{process.env.NODE_ENV || 'development'}</strong><br/>
          Default URL: <strong>{getDefaultBackendUrl()}</strong>
        </p>
      </div>

      <h2>Health & System Endpoints</h2>
      <TestButton endpoint="/health" method="GET" label="Health Check" />
      <TestButton endpoint="/api/v1/ping" method="GET" label="Ping" />

      <h2>Section Story Endpoints</h2>
      <TestButton 
        endpoint="/api/v1/section/personal-information" 
        dataKey="personalInformation"
        label="Personal Information" 
      />
      <TestButton 
        endpoint="/api/v1/section/education" 
        dataKey="education"
        label="Education" 
      />
      <TestButton 
        endpoint="/api/v1/section/residency-intentions" 
        dataKey="residencyIntentions"
        label="Residency Intentions" 
      />
      <TestButton 
        endpoint="/api/v1/section/finance" 
        dataKey="finance"
        label="Finance" 
      />
      <TestButton 
        endpoint="/api/v1/section/social-security-pensions" 
        dataKey="socialSecurity"
        label="Social Security & Pensions" 
      />
      <TestButton 
        endpoint="/api/v1/section/tax-deductions-credits" 
        dataKey="taxDeductions"
        label="Tax Deductions & Credits" 
      />
      <TestButton 
        endpoint="/api/v1/section/future-financial-plans" 
        dataKey="futureFinancialPlans"
        label="Future Financial Plans" 
      />
      <TestButton 
        endpoint="/api/v1/section/additional-information" 
        dataKey="additionalInformation"
        label="Additional Information" 
      />
      <TestButton 
        endpoint="/api/v1/section/summary" 
        dataKey="summary"
        label="Summary" 
      />

      <h2>Advanced Endpoints</h2>
      <TestButton 
        endpoint="/api/v1/tax-advice" 
        dataKey="taxAdvice"
        label="Tax Advice" 
      />
      <TestButton 
        endpoint="/api/v1/custom-prompt" 
        dataKey="customPrompt"
        label="Custom Prompt" 
      />
      <TestButton 
        endpoint="/api/v1/generate-full-story" 
        dataKey="generateFullStory"
        label="Generate Full Story" 
      />
      <TestButton 
        endpoint="/api/v1/perplexity-analysis" 
        dataKey="perplexityAnalysis"
        label="Perplexity Analysis" 
      />

      <h2>Exchange Rate Endpoints</h2>
      <CurrencyConverter />
      <TestButton 
        endpoint="/api/v1/exchange-rates" 
        method="GET"
        label="Get Exchange Rates" 
      />
      <TestButton 
        endpoint="/api/v1/exchange-rates/refresh" 
        dataKey="exchangeRatesRefresh"
        label="Refresh Exchange Rates" 
      />
    </div>
  )
}
