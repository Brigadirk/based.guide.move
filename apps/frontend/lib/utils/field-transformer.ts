/**
 * Field transformation utilities for frontend-backend data conversion
 * Handles camelCase <-> snake_case conversion and field mapping
 */

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert snake_case to camelCase  
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Deep convert object keys from camelCase to snake_case
 */
export function deepCamelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepCamelToSnake)
  }
  
  const converted: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key)
    converted[snakeKey] = deepCamelToSnake(value)
  }
  
  return converted
}

/**
 * Deep convert object keys from snake_case to camelCase
 */
export function deepSnakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepSnakeToCamel)
  }
  
  const converted: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key)
    converted[camelKey] = deepSnakeToCamel(value)
  }
  
  return converted
}

/**
 * Transform finance data for backend submission
 * Handles specific field mappings and snake_case conversion
 */
export function transformFinanceForBackend(financeData: any): any {
  if (!financeData) return financeData
  
  // Create a deep copy to avoid mutations
  const transformed = JSON.parse(JSON.stringify(financeData))
  
  // Fix specific field mappings
  if (transformed.totalWealth) {
    if (transformed.totalWealth.primaryResidence !== undefined) {
      transformed.totalWealth.primary_residence = transformed.totalWealth.primaryResidence
      delete transformed.totalWealth.primaryResidence
    }
  }
  
  // Fix income sources
  if (transformed.incomeSources) {
    transformed.incomeSources = transformed.incomeSources.map((source: any) => {
      const fixed = { ...source }
      if (fixed.continueInDestination !== undefined) {
        fixed.continue_in_destination = fixed.continueInDestination
        delete fixed.continueInDestination
      }
      return fixed
    })
  }
  
  // Fix capital gains structure
  if (transformed.capitalGains?.futureSales) {
    transformed.capitalGains.futureSales = transformed.capitalGains.futureSales.map((sale: any) => {
      const fixed = { ...sale }
      // Handle both surplusValue and expectedGain field names
      if (fixed.surplusValue !== undefined) {
        fixed.surplus_value = fixed.surplusValue
        delete fixed.surplusValue
      } else if (fixed.expectedGain !== undefined) {
        fixed.surplus_value = fixed.expectedGain
        delete fixed.expectedGain
      }
      // Handle holding time variations
      if (fixed.holdingTime !== undefined) {
        fixed.holding_time = fixed.holdingTime
        delete fixed.holdingTime
      } else if (fixed.holdingPeriod !== undefined) {
        fixed.holding_time = fixed.holdingPeriod
        delete fixed.holdingPeriod
      }
      return fixed
    })
  }
  
  // Remove expectedEmployment since it's now consolidated into incomeSources
  if (transformed.expectedEmployment) {
    delete transformed.expectedEmployment
  }
  
  // Convert remaining fields to snake_case
  return deepCamelToSnake(transformed)
}

/**
 * Transform backend response data to frontend format
 * Handles snake_case to camelCase conversion
 */
export function transformFinanceFromBackend(backendData: any): any {
  if (!backendData) return backendData
  
  // Convert to camelCase first
  const transformed = deepSnakeToCamel(backendData)
  
  // Fix specific field mappings back
  if (transformed.totalWealth?.primaryResidence !== undefined) {
    // Already converted by deepSnakeToCamel
  }
  
  if (transformed.incomeSources) {
    transformed.incomeSources = transformed.incomeSources.map((source: any) => {
      const fixed = { ...source }
      if (fixed.continueInDestination !== undefined) {
        // Already converted by deepSnakeToCamel
      }
      return fixed
    })
  }
  
  return transformed
}

/**
 * General purpose form data transformer for backend submission
 */
export function transformFormDataForBackend(formData: any): any {
  if (!formData) return formData
  
  const transformed = JSON.parse(JSON.stringify(formData))
  
  // Apply finance-specific transformations
  if (transformed.finance) {
    transformed.finance = transformFinanceForBackend(transformed.finance)
  }
  
  // Apply other section transformations as needed
  // ... (can be extended for other sections)
  
  return transformed
}
