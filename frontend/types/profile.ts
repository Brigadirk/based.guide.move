export interface PersonalInformation {
  dateOfBirth: string;
  nationalities: { country: string }[];
  maritalStatus: "Single" | "Married" | "Divorced";
  currentResidency: {
    country: string;
    status: "Citizen" | "Permanent resident" | "Temporary resident";
  };
}

export interface IncomeSource {
  type: string;
  amount: number;
  currency: string;
  frequency: "monthly" | "yearly";
}

export interface Asset {
  type: string;
  location?: string;
  value: number;
  currency: string;
}

export interface Liability {
  type: string;
  amount: number;
  currency: string;
}

export interface FinancialInformation {
  incomeSources: IncomeSource[];
  assets: Asset[];
  liabilities: Liability[];
}

export interface ResidencyIntentions {
  moveType: "Permanent" | "Digital Nomad";
  intendedCountry: string;
  durationOfStay: "6 months" | "1 year" | "Indefinite";
  preferredMaximumStayRequirement: "1 month" | "3 months" | "No requirement";
  notes?: string;
}

export interface Dependent {
  name: string;
  relationship: string;
  age: number;
}

export interface Profile {
  id: string;
  nickname: string;
  avatar?: string;
  personalInformation: PersonalInformation;
  financialInformation: FinancialInformation;
  dependents: Dependent[];
  specialCircumstances?: string;
  
  // Partner information (optional)
  partner?: {
    personalInformation: PersonalInformation;
    financialInformation: FinancialInformation;
  };
}

export type ProfileSection = 'basic' | 'tax' | 'lifestyle'

export interface ProfileProgress {
  total: number
  completed: number
  sections: Record<ProfileSection, boolean>
} 