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
  details: Record<string, any>;
  amount: number;
  currency: string;
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
  personalInformation: PersonalInformation;
  financialInformation: FinancialInformation;
  residencyIntentions: ResidencyIntentions;
  dependents: Dependent[];
  specialCircumstances?: string;
  
  // Partner information (optional)
  partner?: {
    personalInformation: PersonalInformation;
    financialInformation: FinancialInformation;
    residencyIntentions: ResidencyIntentions;
  };
}

export type ProfileSection = 'basic' | 'tax' | 'lifestyle'

export interface ProfileProgress {
  total: number
  completed: number
  sections: Record<ProfileSection, boolean>
} 