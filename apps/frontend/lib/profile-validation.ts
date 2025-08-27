/**
 * Profile validation utilities
 */

import { PersonalInformation, FinancialInformation, Profile } from '@/types/profile'

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  sections?: Record<string, ValidationResult>;
}

export interface ValidationStatus {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Alias for compatibility
export const validatePersonalInfo = validatePersonalInformation;

export function validatePersonalInformation(info: PersonalInformation): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!info.dateOfBirth) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Date of birth is required',
      type: 'error'
    });
  }

  if (!info.nationalities || info.nationalities.length === 0) {
    errors.push({
      field: 'nationalities',
      message: 'At least one nationality is required',
      type: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateFinancialInformation(info: FinancialInformation): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!info.incomeSources || info.incomeSources.length === 0) {
    warnings.push({
      field: 'incomeSources',
      message: 'Consider adding income sources for better recommendations',
      type: 'warning'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateProfile(profile: Profile): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const personalValidation = validatePersonalInformation(profile.personalInformation);
  const financialValidation = validateFinancialInformation(profile.financialInformation);

  errors.push(...personalValidation.errors, ...financialValidation.errors);
  warnings.push(...personalValidation.warnings, ...financialValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
