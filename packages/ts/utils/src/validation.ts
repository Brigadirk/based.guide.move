import { z } from 'zod'

export const emailSchema = z.string().email('Please enter a valid email address')

export const requiredStringSchema = z.string().min(1, 'This field is required')

export const optionalStringSchema = z.string().optional()

export const numberSchema = z.number().min(0, 'Must be a positive number')

export const optionalNumberSchema = z.number().min(0).optional()

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}
