/**
 * Enhanced finance validation utilities
 * Provides field-level validation with helpful error messages
 */

export interface ValidationError {
  field: string
  message: string
  type: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  suggestions: ValidationError[]
}

/**
 * Validate individual income source
 */
export function validateIncomeSource(source: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Amount validation
  if (!source.amount || source.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0',
      type: 'error'
    })
  } else if (source.amount > 10000000) {
    errors.push({
      field: 'amount',
      message: 'Amount seems unusually high - please verify',
      type: 'warning'
    })
  }

  // Currency validation
  if (!source.currency) {
    errors.push({
      field: 'currency',
      message: 'Currency is required',
      type: 'error'
    })
  }

  // Country validation (optional for Financial Support)
  if (!source.country && source.category !== "Financial Support") {
    errors.push({
      field: 'country',
      message: 'Country is required',
      type: 'error'
    })
  }

  // Expected income specific validation
  if (!source.continueInDestination) {
    if (!source.timeline) {
      errors.push({
        field: 'timeline',
        message: 'Timeline is required for expected income',
        type: 'error'
      })
    }

    if (!source.confidence) {
      errors.push({
        field: 'confidence',
        message: 'Confidence level helps with planning',
        type: 'warning'
      })
    }

    // Employment specific validation
    if (source.category === 'Employment') {
      const fields = source.fields || {}
      if (!fields.role) {
        errors.push({
          field: 'role',
          message: 'Job role helps with visa applications',
          type: 'warning'
        })
      }
      if (!fields.employer) {
        errors.push({
          field: 'employer',
          message: 'Employer name may be required for work visas',
          type: 'info'
        })
      }
    }
  }

  return errors
}

/**
 * Validate capital gains entry
 */
export function validateCapitalGain(gain: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!gain.asset) {
    errors.push({
      field: 'asset',
      message: 'Asset name is required',
      type: 'error'
    })
  }

  if (!gain.surplusValue || gain.surplusValue <= 0) {
    errors.push({
      field: 'surplusValue',
      message: 'Expected gain must be positive',
      type: 'error'
    })
  } else if (gain.surplusValue > 5000000) {
    errors.push({
      field: 'surplusValue',
      message: 'Large capital gains may have significant tax implications',
      type: 'warning'
    })
  }

  if (!gain.holdingTime) {
    errors.push({
      field: 'holdingTime',
      message: 'Holding period affects tax rates in many countries',
      type: 'info'
    })
  }

  return errors
}

/**
 * Validate total wealth entry
 */
export function validateTotalWealth(wealth: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (wealth.total < 0) {
    errors.push({
      field: 'total',
      message: 'Net worth cannot be negative',
      type: 'error'
    })
  }

  if (wealth.primaryResidence > wealth.total) {
    errors.push({
      field: 'primaryResidence',
      message: 'Primary residence cannot exceed total wealth',
      type: 'error'
    })
  }

  if (wealth.primaryResidence < 0) {
    errors.push({
      field: 'primaryResidence',
      message: 'Primary residence value cannot be negative',
      type: 'error'
    })
  }

  // Wealth tax thresholds
  if (wealth.total > 1000000) {
    errors.push({
      field: 'total',
      message: 'High net worth may trigger wealth taxes in some countries',
      type: 'info'
    })
  }

  return errors
}

/**
 * Comprehensive finance validation
 */
export function validateFinanceData(financeData: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: ValidationError[] = []

  if (!financeData) {
    return { isValid: false, errors: [{ field: 'general', message: 'Finance data is required', type: 'error' }], warnings: [], suggestions: [] }
  }

  // Skip validation if details are skipped
  if (financeData.skipDetails) {
    return { isValid: true, errors: [], warnings: [], suggestions: [] }
  }

  // Income situation validation
  if (!financeData.incomeSituation) {
    errors.push({
      field: 'incomeSituation',
      message: 'Please select your income situation after moving',
      type: 'error'
    })
  }

  // Income sources validation
  const incomeSources = financeData.incomeSources || []
  if (financeData.incomeSituation) {
    const currentSources = incomeSources.filter((source: any) => source.continueInDestination)
    const expectedSources = incomeSources.filter((source: any) => !source.continueInDestination)

    switch (financeData.incomeSituation) {
      case 'continuing_income':
        if (currentSources.length === 0) {
          errors.push({
            field: 'incomeSources',
            message: 'At least one current income source is required for continuing income',
            type: 'error'
          })
        }
        break
      case 'seeking_income':
        if (expectedSources.length === 0) {
          errors.push({
            field: 'incomeSources',
            message: 'At least one expected income source is required when seeking new income',
            type: 'error'
          })
        }
        break
      case 'current_and_new_income':
        if (incomeSources.length === 0) {
          errors.push({
            field: 'incomeSources',
            message: 'At least one income source (current or expected) is required for mixed income situation',
            type: 'error'
          })
        }
        break
      case 'gainfully_unemployed':
        // Self-funded requires total savings/wealth information
        if (!financeData.totalWealth || !financeData.totalWealth.total || financeData.totalWealth.total <= 0) {
          errors.push({
            field: 'totalWealth.total',
            message: 'Total savings/wealth is required when self-funded (living off savings)',
            type: 'error'
          })
        } else if (financeData.totalWealth.total < 50000) {
          warnings.push({
            field: 'totalWealth.total',
            message: 'Consider if this amount is sufficient for your planned duration abroad',
            type: 'warning'
          })
        }
        break
      case 'dependent/supported':
        // Financially supported requires proof of financial support
        const supportSources = incomeSources.filter((source: any) => source.category === "Financial Support")
        if (supportSources.length === 0) {
          errors.push({
            field: 'incomeSources',
            message: 'Financial support details are required when dependent/supported',
            type: 'error'
          })
        } else {
          // Validate support source details
          supportSources.forEach((support: any, index: number) => {
            if (!support.fields?.source || !support.fields?.sourceType) {
              errors.push({
                field: `incomeSources[${index}]`,
                message: 'Support source details (type and source) are required',
                type: 'error'
              })
            }
            if (!support.amount || support.amount <= 0) {
              errors.push({
                field: `incomeSources[${index}].amount`,
                message: 'Support amount must be specified',
                type: 'error'
              })
            } else if (support.amount / 12 < 1000) {
              warnings.push({
                field: `incomeSources[${index}].amount`,
                message: 'Monthly support amount seems low for visa requirements',
                type: 'warning'
              })
            }
          })
        }
        break
    }
  }

  // Validate individual income sources
  incomeSources.forEach((source: any, index: number) => {
    const sourceErrors = validateIncomeSource(source)
    sourceErrors.forEach(error => {
      const prefixedError = {
        ...error,
        field: `incomeSources[${index}].${error.field}`
      }
      
      if (error.type === 'error') errors.push(prefixedError)
      else if (error.type === 'warning') warnings.push(prefixedError)
      else suggestions.push(prefixedError)
    })
  })

  // Validate total wealth
  if (financeData.totalWealth) {
    const wealthErrors = validateTotalWealth(financeData.totalWealth)
    wealthErrors.forEach(error => {
      const prefixedError = {
        ...error,
        field: `totalWealth.${error.field}`
      }
      
      if (error.type === 'error') errors.push(prefixedError)
      else if (error.type === 'warning') warnings.push(prefixedError)
      else suggestions.push(prefixedError)
    })
  }

  // Validate capital gains
  const capitalGains = financeData.capitalGains?.futureSales || []
  capitalGains.forEach((gain: any, index: number) => {
    const gainErrors = validateCapitalGain(gain)
    gainErrors.forEach(error => {
      const prefixedError = {
        ...error,
        field: `capitalGains.futureSales[${index}].${error.field}`
      }
      
      if (error.type === 'error') errors.push(prefixedError)
      else if (error.type === 'warning') warnings.push(prefixedError)
      else suggestions.push(prefixedError)
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}
