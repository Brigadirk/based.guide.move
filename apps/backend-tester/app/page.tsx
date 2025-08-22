'use client'

import { useState } from 'react'

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
  }
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

  // Backend URL - uses Railway internal for deployed version
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? 'http://bonobo-backend.railway.internal'
    : 'http://localhost:5001'

  const callApi = async (endpoint: string, method: 'GET' | 'POST' = 'POST', data?: any) => {
    const key = endpoint.replace('/', '_')
    setLoading(prev => ({ ...prev, [key]: true }))
    
    try {
      console.log(`Calling ${method} ${BACKEND_URL}${endpoint}`)
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
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, options)
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
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '11px',
              maxHeight: '300px'
            }}>
              {response.error || JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>
        🧪 Backend API Tester - BasedGuide
      </h1>
      
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Environment Info:</h3>
        <p style={{ margin: 0, fontFamily: 'monospace' }}>
          Backend URL: <strong>{BACKEND_URL}</strong><br/>
          Environment: <strong>{process.env.NODE_ENV || 'development'}</strong>
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
    </div>
  )
}
