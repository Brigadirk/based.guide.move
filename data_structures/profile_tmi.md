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
        }
      ],
      "maritalStatus": "string", // mandatory
      "currentResidency": {
        "description": "Current country of residency and residency status (e.g., citizen, permanent resident, temporary resident).",
        "country": "string", // mandatory
        "status": "string" // mandatory
      },
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
      "reasons_for_moving": ["work", "business", "retire", "study", "family", "lifestyle", "other"],
      "open_to_investment": "boolean", // mandatory
      "open_to_resigning_citizenship": "boolean'",
      "investment_details": {
        "types": ["real_estate", "business", "government_bonds"],
        "amount_range": "range"
      },
      "time_in_other_countries": [
        {
          "country": "country_name",
          "days_per_year": 0,
          "purpose": "business|personal|both"
        }
      ]
      "intendedCountry": "string", // mandatory
      "durationOfStay": "string", // mandatory (e.g., 6 months, 1 year, indefinite)
      "preferredMaximumMinimumStayRequirement": "string", // mandatory (e.g., "1 month", "3 months", "no requirement")
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
      ], 
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
    "languageProficiency": [
      {
        "description": "Details of language proficiency, including language and level.",
        "language": "string", // mandatory (if language proficiency is relevant)
        "level": "string" // mandatory (if language proficiency is relevant)
      }
    ], // optional (only if language proficiency is relevant)
    "criminalRecord": {
      "description": "Details of any criminal record, which could affect visa applications.",
      "hasRecord": "boolean", // mandatory
      "details": "string" // optional (only if hasRecord is true)
    }
  }
}
```

Latest suggestions:

```json
{
  "individual": {
    "financialInformation": {
      "assets": {
        "realEstate": [
          {
            "description": "Details of real estate owned by the individual.",
            "location": "string", // Property location determines property tax jurisdiction
            "value": "number", // Current market value for wealth tax calculations
            "currency": "string", // Currency for conversion calculations
            
            // New fields for capital gains calculation
            "acquisitionDate": "YYYY-MM-DD", // Date purchased - determines holding period
            "acquisitionPrice": "number", // Original purchase price - basis for capital gain
            "intendToSell": "boolean", // Whether they plan to sell this asset
            "plannedSaleDetails": {
              "expectedSalePrice": "number", // Projected selling price
              "expectedSaleDate": "YYYY-MM-DD", // Planned sale timing (before/after move)
              "sellBeforeMoving": "boolean", // Critical for determining which country taxes the gain
              "holdingPeriodBreakdown": {
                "percentageLongTerm": "number", // Percentage qualifying as long-term (lower tax rates)
                "percentageShortTerm": "number" // Percentage qualifying as short-term (higher tax rates)
              }
            }
          }
        ],
        "investments": [
          {
            "description": "Details of investments owned by the individual.",
            "type": "string", // Investment type affects tax treatment
            "value": "number", // Current market value
            "currency": "string", // For accurate currency conversion
            
            // New fields for capital gains calculation
            "acquisitionDate": "YYYY-MM-DD", // Date acquired - determines holding period
            "acquisitionPrice": "number", // Original purchase price - basis for capital gain
            "intendToSell": "boolean", // Whether they plan to sell this investment
            "plannedSaleDetails": {
              "expectedSalePrice": "number", // Projected selling price
              "expectedSaleDate": "YYYY-MM-DD", // Planned sale timing
              "sellBeforeMoving": "boolean", // Critical for determining which country taxes the gain
              "holdingPeriodBreakdown": {
                "percentageLongTerm": "number", // Percentage qualifying as long-term (lower tax rates)
                "percentageShortTerm": "number" // Percentage qualifying as short-term (higher tax rates)
              }
            }
          }
        ],
        "cryptocurrencyHoldings": [
          {
            "description": "Details of cryptocurrency holdings.",
            "type": "string", // Crypto type affects tax treatment in some jurisdictions
            "value": "number", // Current market value
            "currency": "string", // Currency for valuation
            
            // New fields for capital gains calculation
            "acquisitionDetails": [
              {
                "percentageOfHolding": "number", // What percentage of total holding this lot represents
                "acquisitionDate": "YYYY-MM-DD", // Purchase date of this lot
                "acquisitionPrice": "number", // Purchase price of this lot
                "currency": "string" // Currency used for purchase
              }
            ],
            "intendToSell": "boolean", // Whether they plan to sell crypto
            "plannedSaleDetails": {
              "percentageToSell": "number", // Percentage of total holdings they plan to sell
              "expectedSalePrice": "number", // Projected average selling price
              "expectedSaleDate": "YYYY-MM-DD", // Planned sale timing
              "sellBeforeMoving": "boolean", // Critical for determining which country taxes the gain
              "holdingPeriodBreakdown": {
                "percentageLongTerm": "number", // Percentage qualifying as long-term
                "percentageShortTerm": "number" // Percentage qualifying as short-term
              }
            }
          }
        ],
        "retirementAccounts": [
          {
            "description": "Details of retirement accounts owned by the individual.",
            "type": "string", // Account type affects tax treatment
            "value": "number", // Current value
            "currency": "string", // For accurate currency conversion
            "countryOfEstablishment": "string", // Country where account is established affects tax treatment
            
            // New fields for distribution/withdrawal planning
            "contributionType": "string", // Pre-tax or after-tax contributions
            "intendToWithdraw": "boolean", // Whether they plan to take distributions
            "plannedWithdrawalDetails": {
              "amountToWithdraw": "number", // How much they plan to withdraw
              "expectedWithdrawalDate": "YYYY-MM-DD", // When they plan to withdraw
              "withdrawBeforeMoving": "boolean", // Critical for determining which country taxes the distribution
              "earlyWithdrawalPenalties": "boolean" // Whether penalties might apply
            }
          }
        ]
      },
      
      // New summary section for capital gains overview
      "capitalGainsSummary": {
        "totalExpectedCapitalGains": "number", // Sum of all expected capital gains
        "currency": "string", // Base currency for calculations
        "percentageRealizedBeforeMove": "number", // What percentage will be realized before relocating
        "percentageRealizedAfterMove": "number", // What percentage will be realized after relocating
        "holdingPeriodSummary": {
          "percentageLongTerm": "number", // Overall percentage of gains that are long-term
          "percentageShortTerm": "number" // Overall percentage of gains that are short-term
        }
      }
    }
  }
}
```