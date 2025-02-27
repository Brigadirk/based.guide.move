```json
{
  "description": "This JSON is designed to gather all relevant information for a tax and migration rundown for an individual and their partner. It includes personal, financial, and residency details, as well as preferences for relocation. The structure is optimized for use with an LLM to generate detailed tax and migration advice, covering scenarios such as digital nomad visas, permanent residency, and tax optimization.",
  "individual": {
    "description": "Primary individual seeking tax and migration information.",
    "personalInformation": {
      "description": "Personal details of the primary individual, including name, date of birth, nationality, and current residency status.",
      "fullName": "string", // mandatory
      "dateOfBirth": "YYYY-MM-DD", // mandatory
      "nationalities": [
        {
          "description": "Details of the individual's nationalities, including country and tax implications.",
          "country": "string", // mandatory
          "taxImplications": {
            "worldwideTaxation": "boolean", // mandatory if country imposes worldwide taxation (e.g., U.S., Eritrea)
            "taxTreatyApplicable": "boolean" // mandatory if a tax treaty applies
          }
        }
      ],
      "maritalStatus": "string", // mandatory
      "currentResidency": {
        "description": "Current country of residency and residency status (e.g., citizen, permanent resident, temporary resident).",
        "country": "string", // mandatory
        "status": "string" // mandatory
      },
      "passportDetails": [
        {
          "description": "Details of the individual's passports, including country of issue and expiry date.",
          "countryOfIssue": "string", // mandatory
          "expiryDate": "YYYY-MM-DD" // mandatory
        }
      ],
      "contactInformation": {
        "description": "Contact details of the primary individual.",
        "email": "string", // optional
        "phoneNumber": "string" // optional
      }
    },
    "financialInformation": {
      "description": "Financial details of the primary individual, including income, assets, liabilities, and net worth.",
      "annualIncome": {
        "description": "Total annual income of the primary individual, including currency.",
        "amount": "number", // mandatory
        "currency": "string" // mandatory
      },
      "incomeSources": [
        {
          "description": "Details of each income source, including type, country of origin, amount, currency, and tax-related information.",
          "type": "string", // mandatory (e.g., employment, freelance, investments, rental)
          "country": "string", // mandatory (e.g., sourced from the USA)
          "amount": "number", // mandatory
          "currency": "string" // mandatory
        }
      ],
      "assets": {
        "description": "Details of the primary individual's assets, including real estate, investments, and retirement accounts.",
        "realEstate": [
          {
            "description": "Details of real estate owned by the primary individual, including location, value, and currency.",
            "location": "string", // mandatory
            "value": "number", // mandatory
            "currency": "string" // mandatory
          }
        ], // optional (only if real estate is owned)
        "investments": [
          {
            "description": "Details of investments owned by the primary individual, including type, value, and currency.",
            "type": "string", // mandatory (e.g., stocks, bonds)
            "value": "number", // mandatory
            "currency": "string" // mandatory
          }
        ], // optional (only if investments are held)
        "retirementAccounts": [
          {
            "description": "Details of retirement accounts owned by the primary individual, including type, value, and currency.",
            "type": "string", // mandatory (e.g., 401(k), IRA)
            "value": "number", // mandatory
            "currency": "string" // mandatory
          }
        ], // optional (only if retirement accounts exist)
        "cryptocurrencyHoldings": [
          {
            "description": "Details of cryptocurrency holdings, including type, value, and currency.",
            "type": "string", // mandatory (e.g., NFT, digital currency)
            "value": "number", // mandatory
            "currency": "string" // mandatory (the currency you value the cryptocurrency in, e.g., dollar or euro)
          }
        ] // optional (only if cryptocurrency is held)
      },
      "liabilities": {
        "description": "Details of the primary individual's liabilities, including loans and other debts.",
        "loans": [
          {
            "description": "Details of loans held by the primary individual, including type, amount, and currency.",
            "type": "string", // mandatory (e.g., mortgage, personal loan)
            "amount": "number", // mandatory
            "currency": "string" // mandatory
          }
        ] // optional (only if loans exist)
      },
      "netWorth": {
        "description": "Total net worth of the primary individual, including currency.",
        "totalValue": "number", // mandatory
        "currency": "string" // mandatory
      },
      "taxAdvantagedAccounts": [
        {
          "description": "Details of tax-advantaged accounts, such as health savings accounts (HSA) or education savings accounts (ESA).",
          "type": "string", // mandatory
          "value": "number", // mandatory
          "currency": "string" // mandatory
        }
      ] // optional (only if tax-advantaged accounts exist)
    },
    "residencyIntentions": {
      "description": "Details about the primary individual's intended relocation, including type of move, intended country, and preferences for stay requirements.",
      "moveType": "string", // mandatory (e.g., permanent, digital nomad)
      "intendedCountry": "string", // mandatory
      "durationOfStay": "string", // mandatory (e.g., 6 months, 1 year, indefinite)
      "visaType": "string", // optional (if known)
      "preferredMaximumStayRequirement": "string", // mandatory (e.g., "1 month", "3 months", "no requirement")
      "familyReunificationEligibility": "boolean", // optional (only if family reunification is desired)
      "healthInsuranceRequirement": "string", // optional (e.g., "must have health insurance")
      "visaSponsorship": "string", // optional (e.g., employer-sponsored, self-sponsored)
      "notes": "string" // optional (additional context)
    },
    "taxHistory": {
      "description": "Tax history of the primary individual, including previous countries of residency and current tax obligations.",
      "previousCountriesOfResidency": [
        {
          "description": "Details of previous countries of residency, including years spent and tax obligations.",
          "country": "string", // mandatory
          "years": "number", // mandatory
          "taxObligationsFulfilled": "boolean", // mandatory
          "unpaidTaxes": "boolean" // mandatory
        }
      ], // optional (only if the individual has lived in other countries)
      "currentTaxObligations": {
        "description": "Details of current tax obligations, including country, outstanding taxes, and currency.",
        "country": "string", // mandatory
        "outstandingTaxes": "number", // mandatory
        "currency": "string" // mandatory
      },
      "taxAudits": {
        "description": "Details of any tax audits the individual has undergone.",
        "hasAudit": "boolean", // mandatory
        "details": "string" // optional (only if hasAudit is true)
      },
      "taxRefunds": {
        "description": "Details of any tax refunds received.",
        "amount": "number", // optional (only if refunds were received)
        "currency": "string" // optional (only if refunds were received)
      }
    },
    "digitalNomadDetails": {
      "description": "Specific details for digital nomads, including remote work and freelance income.",
      "remoteEmployer": {
        "description": "Details of the primary individual's remote employer, including location and tax withholding status.",
        "employerLocation": "string", // mandatory (if employed remotely)
        "taxWithholding": "boolean" // mandatory (if employed remotely)
      }, // optional (only if employed remotely)
      "freelanceClients": [
        {
          "description": "Details of freelance clients, including location, annual income, and currency.",
          "clientLocation": "string", // mandatory (if freelance income exists)
          "annualIncome": "number", // mandatory (if freelance income exists)
          "currency": "string" // mandatory (if freelance income exists)
        }
      ], // optional (only if freelance income exists)
      "coworkingSpaceMemberships": [
        {
          "description": "Details of coworking space memberships, including location and cost.",
          "location": "string", // mandatory (if coworking space is used)
          "cost": "number", // mandatory (if coworking space is used)
          "currency": "string" // mandatory (if coworking space is used)
        }
      ], // optional (only if coworking space is used)
      "remoteWorkTools": [
        {
          "description": "Details of remote work tools, such as VPNs or software subscriptions.",
          "type": "string", // mandatory (if tools are used)
          "cost": "number", // mandatory (if tools are used)
          "currency": "string" // mandatory (if tools are used)
        }
      ], // optional (only if tools are used)
      "timeZonePreferences": "string" // optional (e.g., "prefer working in GMT+2")
    },
    "taxDeductionsAndCredits": {
      "description": "Potential tax deductions and credits applicable to the primary individual.",
      "potentialDeductions": [
        {
          "description": "Details of potential tax deductions, including type, amount, and currency.",
          "type": "string", // mandatory (if deductions exist)
          "amount": "number", // mandatory (if deductions exist)
          "currency": "string" // mandatory (if deductions exist)
        }
      ], // optional (only if deductions exist)
      "taxCredits": [
        {
          "description": "Details of potential tax credits, including type, amount, and currency.",
          "type": "string", // mandatory (if credits exist)
          "amount": "number", // mandatory (if credits exist)
          "currency": "string" // mandatory (if credits exist)
        }
      ], // optional (only if credits exist)
      "foreignEarnedIncomeExclusion": {
        "description": "Details of foreign-earned income exclusion, if applicable.",
        "eligible": "boolean", // mandatory (if foreign income exists)
        "amount": "number", // optional (only if eligible is true)
        "currency": "string" // optional (only if eligible is true)
      } // optional (only if foreign income exists)
    },
    "futureFinancialPlans": {
      "description": "Future financial plans of the primary individual, such as investments or business ventures.",
      "plannedInvestments": [
        {
          "description": "Details of planned investments, including type, country, estimated value, and currency.",
          "type": "string", // mandatory (if planned investments exist)
          "country": "string", // mandatory (if planned investments exist)
          "estimatedValue": "number", // mandatory (if planned investments exist)
          "currency": "string" // mandatory (if planned investments exist)
        }
      ], // optional (only if planned investments exist)
      "businessPlans": [
        {
          "description": "Details of planned business ventures, including type, country, estimated investment, and currency.",
          "type": "string", // mandatory (if business plans exist)
          "country": "string", // mandatory (if business plans exist)
          "estimatedInvestment": "number", // mandatory (if business plans exist)
          "currency": "string" // mandatory (if business plans exist)
        }
      ], // optional (only if business plans exist)
      "retirementPlanning": {
        "description": "Details of retirement planning, including target retirement age and savings goals.",
        "targetRetirementAge": "number", // optional
        "savingsGoal": "number", // optional
        "currency": "string" // optional
      }, // optional
      "charitableGivingGoals": {
        "description": "Details of charitable giving goals, including target amount and currency.",
        "targetAmount": "number", // optional
        "currency": "string" // optional
      }, // optional
      "estatePlanning": {
        "description": "Details of estate planning, such as wills or trusts.",
        "hasWill": "boolean", // optional
        "hasTrust": "boolean" // optional
      } // optional
    }
  },
  "partner": {
    "description": "Details of the partner (e.g., girlfriend), including personal, financial, and residency information.",
    "personalInformation": {
      "description": "Personal details of the partner, including name, date of birth, nationality, and current residency status.",
      "fullName": "string", // mandatory
      "dateOfBirth": "YYYY-MM-DD", // mandatory
      "nationalities": [
        {
          "description": "Details of the partner's nationalities, including country and tax implications.",
          "country": "string", // mandatory
          "taxImplications": {
            "worldwideTaxation": "boolean", // mandatory if country imposes worldwide taxation
            "taxTreatyApplicable": "boolean" // mandatory if a tax treaty applies
          }
        }
      ],
      "maritalStatus": "string", // mandatory
      "currentResidency": {
        "description": "Current country of residency and residency status of the partner.",
        "country": "string", // mandatory
        "status": "string" // mandatory
      },
      "contactInformation": {
        "description": "Contact details of the partner.",
        "email": "string", // optional
        "phoneNumber": "string" // optional
      }
    },
    "financialInformation": {
      "description": "Financial details of the partner, including income, assets, and liabilities.",
      "annualIncome": {
        "description": "Total annual income of the partner, including currency.",
        "amount": "number", // mandatory
        "currency": "string" // mandatory
      },
      "incomeSources": [
        {
          "description": "Details of each income source of the partner, including type, country of origin, amount, currency, and tax-related information.",
          "type": "string", // mandatory (e.g., employment, freelance, investments)
          "country": "string", // mandatory
          "amount": "number", // mandatory
          "currency": "string" // mandatory
        }
      ], // optional (only if income exists)
      "assets": {
        "description": "Details of the partner's assets, including real estate and investments.",
        "realEstate": [
          {
            "description": "Details of real estate owned by the partner, including location, value, and currency.",
            "location": "string", // mandatory (if real estate is owned)
            "value": "number", // mandatory (if real estate is owned)
            "currency": "string" // mandatory (if real estate is owned)
          }
        ], // optional (only if real estate is owned)
        "investments": [
          {
            "description": "Details of investments owned by the partner, including type, value, and currency.",
            "type": "string", // mandatory (if investments exist)
            "value": "number", // mandatory (if investments exist)
            "currency": "string" // mandatory (if investments exist)
          }
        ] // optional (only if investments exist)
      },
      "liabilities": {
        "description": "Details of the partner's liabilities, including loans and other debts.",
        "loans": [
          {
            "description": "Details of loans held by the partner, including type, amount, and currency.",
            "type": "string", // mandatory (if loans exist)
            "amount": "number", // mandatory (if loans exist)
            "currency": "string" // mandatory (if loans exist)
          }
        ] // optional (only if loans exist)
      }
    },
    "residencyIntentions": {
      "description": "Details about the partner's intended relocation, including type of move, intended country, and preferences for stay requirements.",
      "moveType": "string", // mandatory (e.g., permanent, digital nomad)
      "intendedCountry": "string", // mandatory
      "durationOfStay": "string", // mandatory (e.g., 6 months, 1 year, indefinite)
      "visaType": "string", // optional (if known)
      "preferredMaximumStayRequirement": "string", // mandatory (e.g., "1 month", "3 months", "no requirement")
      "notes": "string" // optional (additional context)
    },
    "employmentStatus": {
      "description": "Details of the partner's employment status.",
      "status": "string", // mandatory (e.g., employed, unemployed, student)
      "potentialIncome": "number", // optional (only if employed or potential income exists)
      "currency": "string" // optional (only if employed or potential income exists)
    }
  },
  "additionalInformation": {
    "description": "Additional context that may impact tax or migration decisions, including dependents, special circumstances, and tax treaty information.",
    "dependents": [
      {
        "description": "Details of dependents, including name, relationship, and age.",
        "name": "string", // mandatory (if dependents exist)
        "relationship": "string", // mandatory (if dependents exist)
        "age": "number" // mandatory (if dependents exist)
      }
    ], // optional (only if dependents exist)
    "specialCircumstances": {
      "description": "Any special circumstances that may affect tax or migration, such as dual citizenship or tax treaties.",
      "details": "string" // optional (only if special circumstances exist)
    },
    "taxTreatyCountries": [
      {
        "description": "Details of countries with which the individual or partner has a tax treaty.",
        "country": "string", // mandatory (if tax treaty exists)
        "treatyDetails": "string" // mandatory (if tax treaty exists)
      }
    ], // optional (only if tax treaties exist)
    "languageProficiency": [
      {
        "description": "Details of language proficiency, including language and level.",
        "language": "string", // mandatory (if language proficiency is relevant)
        "level": "string" // mandatory (if language proficiency is relevant)
      }
    ], // optional (only if language proficiency is relevant)
    "culturalPreferences": {
      "description": "Details of cultural preferences, such as climate or lifestyle preferences.",
      "preferences": "string" // optional
    },
    "criminalRecord": {
      "description": "Details of any criminal record, which could affect visa applications.",
      "hasRecord": "boolean", // mandatory
      "details": "string" // optional (only if hasRecord is true)
    }
  }
}```