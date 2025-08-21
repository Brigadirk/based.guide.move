export interface Country {
  id: string
  name: string
  flag: string
  currency: string
  region: string
  scores?: {
    tax?: number
    visa?: number
    lifestyle?: number
    cost?: number
  }
}

export interface FormData {
  [key: string]: any
}
