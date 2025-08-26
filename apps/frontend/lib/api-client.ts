/**
 * API client for communicating with the Base Recommender backend
 */

import { transformFinanceForBackend, transformFormDataForBackend } from './utils/field-transformer'

// Use internal proxy instead of direct backend calls
const API_BASE_URL = '/api/backend';

export interface SectionStoryResponse {
  status: string;
  section: string;
  story: string;
}

export interface ApiError {
  detail: string;
}

class ApiClient {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * Get personal information story
   */
  async getPersonalInformationStory(personalInformation: any): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/personal-information', {
      personal_information: personalInformation,
    });
  }

  /**
   * Get education story
   */
  async getEducationStory(education: any, residencyIntentions?: any): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/education', {
      education,
      residency_intentions: residencyIntentions,
    });
  }

  /**
   * Get residency intentions story
   */
  async getResidencyIntentionsStory(residencyIntentions: any): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/residency-intentions', {
      residency_intentions: residencyIntentions,
    });
  }

  /**
   * Get finance story
   */
  async getFinanceStory(finance: any, destinationCountry?: string): Promise<SectionStoryResponse> {
    const transformedFinance = transformFinanceForBackend(finance);
    return this.makeRequest<SectionStoryResponse>('/section/finance', {
      finance: transformedFinance,
      destination_country: destinationCountry,
    });
  }

  /**
   * Get social security and pensions story
   */
  async getSocialSecurityStory(socialSecurityAndPensions: any, destinationCountry?: string, skipFinanceDetails?: boolean): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/social-security-pensions', {
      social_security_and_pensions: socialSecurityAndPensions,
      destination_country: destinationCountry,
      skip_finance_details: skipFinanceDetails,
    });
  }

  /**
   * Get tax deductions and credits story
   */
  async getTaxDeductionsStory(taxDeductionsAndCredits: any, destinationCountry?: string, skipFinanceDetails?: boolean): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/tax-deductions-credits', {
      tax_deductions_and_credits: taxDeductionsAndCredits,
      destination_country: destinationCountry,
      skip_finance_details: skipFinanceDetails,
    });
  }

  /**
   * Get future financial plans story
   */
  async getFutureFinancialPlansStory(futureFinancialPlans: any, destinationCountry?: string, skipFinanceDetails?: boolean): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/future-financial-plans', {
      future_financial_plans: futureFinancialPlans,
      destination_country: destinationCountry,
      skip_finance_details: skipFinanceDetails,
    });
  }

  /**
   * Get additional information story
   */
  async getAdditionalInformationStory(additionalInformation: any): Promise<SectionStoryResponse> {
    return this.makeRequest<SectionStoryResponse>('/section/additional-information', {
      additional_information: additionalInformation,
    });
  }

  /**
   * Get complete summary story
   */
  async getSummaryStory(profile: any): Promise<SectionStoryResponse> {
    const transformedProfile = transformFormDataForBackend(profile);
    return this.makeRequest<SectionStoryResponse>('/section/summary', {
      profile: transformedProfile,
    });
  }

  /**
   * Get the full story for all sections combined
   */
  async getFullStory(profile: any): Promise<SectionStoryResponse> {
    const transformedProfile = transformFormDataForBackend(profile);
    return this.makeRequest<SectionStoryResponse>('/generate-full-story', {
      profile: transformedProfile,
    });
  }

  /**
   * Get Perplexity AI analysis
   */
  async getPerplexityAnalysis(prompt: string, model: string): Promise<{ result: string }> {
    return this.makeRequest<{ result: string }>('/perplexity-analysis', {
      prompt,
      model,
    });
  }

  /**
   * Health check endpoint
   */
  async ping(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/ping`);
    return await response.json();
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
