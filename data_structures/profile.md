```json
{
  "description": "This JSON is designed to gather all relevant information for a tax and migration rundown for an individual and their partner. It includes personal, financial, and residency details, as well as preferences for relocation. The structure is optimized for use with an LLM to generate detailed tax and migration advice, covering scenarios such as digital nomad visas, permanent residency, and tax optimization.",
  "individual": {
    "description": "Primary individual seeking tax and migration information.",
    "personalInformation": {
      "description": "Personal details of the primary individual, including name, date of birth, nationality, and current residency status.",
      "dateOfBirth": "YYYY-MM-DD", // mandatory
      "nationalities": [
        {
          "description": "Details of the individual's nationalities, including country and tax implications.",
          "country": "string" // mandatory to fill in at least one
        }
      ],
      "maritalStatus": "string", // mandatory
      "currentResidency": {
        "description": "Current country of residency and residency status (e.g., citizen, permanent resident, temporary resident).",
        "country": "string", // mandatory
        "status": "string" // mandatory
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
          "type": "string", // mandatory (e.g., employment, freelance, business, investments, rental)
          "subtype": "string", // optional (e.g., remote employment, self-employed, multiple clients, etc.)
          "country": "string", // mandatory (e.g., sourced from the USA)
          "amount": "number", // mandatory
          "currency": "string", // mandatory
          "employmentDetails": {
            "description": "Details specific to employment income.",
            "employerType": "string", // optional (e.g., remote employer directly, remote employer to their business)
            "employerName": "string", // optional
            "isRemote": "boolean", // optional (true if the job is remote)
            "contractType": "string" // optional (e.g., full-time, part-time, contract)
          },
          "businessDetails": {
            "description": "Details specific to business income.",
            "businessType": "string", // optional (e.g., sole proprietorship, LLC, corporation)
            "businessName": "string", // optional
            "numberOfClients": "number", // optional (if applicable)
            "isRemote": "boolean" // optional (true if the business operates remotely)
          },
          "selfEmploymentDetails": {
            "description": "Details specific to self-employment income.",
            "activityType": "string", // optional (e.g., freelancing, consulting, gig work)
            "numberOfClients": "number", // optional (if applicable)
            "isRemote": "boolean" // optional (true if the work is remote)
          },
          "otherIncomeDetails": {
            "description": "Details specific to other types of income (e.g., investments, rental income).",
            "incomeType": "string", // optional (e.g., dividends, interest, rental income)
            "source": "string" // optional (e.g., rental property, stock portfolio)
          },
          "noJobFlag": "boolean" // optional (true if the user has no job or income)
        }
      ], // allow user to flag that they do not have a job.
      "assets": {
        "description": "Details of the primary individual's assets, including real estate, investments, and retirement accounts.",
        "realEstate": [
          {
            "description": "Details of real estate owned by the primary individual, including location, value, and currency.",
            "location": "string", // mandatory
            "value": "number", // mandatory
            "currency": "string", // mandatory
            "potentialSale": {
              "description": "Details of a potential sale of this real estate, including expected sale price and holding period.",
              "plannedSale": "boolean", // mandatory (true if the user plans to sell this property)
              "expectedSalePrice": "number", // mandatory if plannedSale is true
              "purchasePrice": "number", // mandatory if plannedSale is true
              "holdingPeriod": "string", // mandatory if plannedSale is true (e.g., "less than 1 year", "more than 1 year")
              "improvements": "number", // optional (cost of improvements made to the property)
              "transactionCosts": "number" // optional (e.g., broker fees, legal fees)
            }
          }
        ], // optional (only if real estate is owned)
        "investments": [
          {
            "description": "Details of investments owned by the primary individual, including type, value, and currency.",
            "type": "string", // mandatory (e.g., stocks, bonds)
            "value": "number", // mandatory
            "currency": "string", // mandatory
            "potentialSale": {
              "description": "Details of a potential sale of these investments, including expected sale price and holding period.",
              "plannedSale": "boolean", // mandatory (true if the user plans to sell these investments)
              "expectedSalePrice": "number", // mandatory if plannedSale is true
              "purchasePrice": "number", // mandatory if plannedSale is true
              "holdingPeriod": "string", // mandatory if plannedSale is true (e.g., "less than 1 year", "more than 1 year")
              "transactionCosts": "number" // optional (e.g., broker fees)
            }
          }
        ], // optional (only if investments are held)
        "cryptocurrencyHoldings": [
          {
            "description": "Details of cryptocurrency holdings, including type, value, and currency.",
            "type": "string", // mandatory (e.g., NFT, digital currency)
            "value": "number", // mandatory
            "currency": "string", // mandatory (the currency you value the cryptocurrency in, e.g., dollar or euro)
            "potentialSale": {
              "description": "Details of a potential sale of this cryptocurrency, including expected sale price and holding period.",
              "plannedSale": "boolean", // mandatory (true if the user plans to sell this cryptocurrency)
              "expectedSalePrice": "number", // mandatory if plannedSale is true
              "purchasePrice": "number", // mandatory if plannedSale is true
              "holdingPeriod": "string", // mandatory if plannedSale is true (e.g., "less than 1 year", "more than 1 year")
              "transactionCosts": "number" // optional (e.g., exchange fees)
            }
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
      ], // optional (only if tax-advantaged accounts exist)
      "capitalGainsTaxEstimation": {
        "description": "Details to estimate capital gains tax liability, including exemptions, deductions, and applicable tax rates.",
        "applicableTaxRates": {
          "shortTerm": "number", // mandatory (tax rate for assets held less than 1 year)
          "longTerm": "number" // mandatory (tax rate for assets held more than 1 year)
        },
        "exemptions": {
          "primaryResidenceExclusion": "boolean", // optional (true if the user qualifies for primary residence exclusion)
          "annualExemptionAmount": "number" // optional (amount of annual capital gains exemption, if applicable)
        },
        "capitalLosses": {
          "description": "Details of capital losses that can be used to offset capital gains.",
          "amount": "number", // optional (total capital losses from previous years)
          "currency": "string" // optional (currency of capital losses)
        }
      }
    },
    "residencyIntentions": {
      "description": "Details about the primary individual's intended relocation, including type of move, intended country, and preferences for stay requirements.",
      "moveType": "string", // mandatory (e.g., permanent, digital nomad homebase)
      "intendedCountry": "string", // mandatory
      "durationOfStay": "string", // mandatory (e.g., 6 months, 1 year, indefinite)
      "preferredMaximumMinimumStayRequirement": "string", // mandatory (e.g., "1 month", "3 months", "no requirement") explanation: some countries require residents to stay in the country for some minimum of time, at least for the first few years of residency.
      "notes": "string" // optional (additional context)
    },
    "taxHistory": { // optional
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
      "$ref": "#/individual/financialInformation" // reuse the financialInformation structure from the individual
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
}
```