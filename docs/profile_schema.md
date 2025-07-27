# Profile JSON Schema (WIP)

This document enumerates every field emitted by the Streamlit questionnaire, 
describes its purpose, allowed values, and how it is used by the backend.

> NOTE This file is generated **manually** from a first pass over `app_components/`.  
> More options will be filled in as we continue to parse the remaining components.

## 1. personalInformation
| Field | Type | Allowed Values / Format | Notes |
|-------|------|------------------------|-------|
| dateOfBirth | `YYYY-MM-DD` | Any past date | Age determines retirement, credits |
| nationalities[].country | string (country name) | From `helpers.get_country_list()` | May be multiple |
| nationalities[].willingToRenounce | bool | true / false | Impacts citizenship-based taxation |
| maritalStatus | enum | `Single`, `Official Partnership`, `Married`, `Divorced`, `Widowed` | Affects filing status |
| currentResidency.country | string | Country name | Current tax residency |
| currentResidency.status | enum | `Citizen`, `Permanent Resident`, `Temporary Resident` | Determines rights/obligations |
| currentResidency.duration | float years | 0.0-100.0 | Only asked when status = Temporary Resident |
| relocationPartner | bool | true / false | Toggles partner sub-section |
| relocationPartnerInfo.relationshipType | enum | `Spouse`, `Unmarried Partner`, `Official Partnership` | |
| relocationPartnerInfo.sameSex | bool | | Impacts visa options in some countries |
| relocationPartnerInfo.fullRelationshipDuration | float years | | |
| relocationPartnerInfo.officialRelationshipDuration | float years | | |
| relocationPartnerInfo.partnerNationalities[].country | string | Country | |
| numRelocationDependents | int | 0-10 | |
| relocationDependents[] | object | see child fields | |

### Relationship
* `currentResidency.country` is auto-added to `nationalities` when status is `Citizen`.
* Dependents rely on `numRelocationDependents` count.

## 2. education
| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| isStudent | bool | | affects visa categories |
| currentSchool | string | | |
| currentFieldOfStudy | string | | |
| previousDegrees[].degree | string | free text |
| visaSkills[].skill | string | free text | skills used for special visas |
| interestedInStudying | bool | | |

## 3. residencyIntentions
| Field | Type | Allowed Values | Notes |
| destinationCountry.country | string | | |
| destinationCountry.moveType | enum | `Permanent`, `Temporary`, `Remote`, etc. | |
| residencyPlans.applyForResidency | bool | |
| citizenshipPlans.interestedInCitizenship | bool | |
| languageProficiency.individual | dict{lang:int(0-6)} | 0=None, 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2 | CEFR proficiency levels |
| languageProficiency.partner | dict{lang:int(0-6)} | Same scale as individual | Partner's CEFR proficiency |
| languageProficiency.willing_to_learn | array[string] | Language names | Languages user is willing to learn |
| languageProficiency.can_teach | dict{lang:string} | Teaching capability level | Languages user can teach |
| languageProficiency.other_languages | array[object] | Language objects | Additional languages not in destination |
| centerOfLife.maintainsSignificantTies | bool | |

(… additional fields will be documented)

---

### Relationships
* `destinationCountry.moveType` influences which questions appear later (e.g. intendedTemporaryDurationOfStay).

---

## 4. finance
| Field | Type | Allowed Values / Format | Notes |
|-------|------|------------------------|-------|
| totalWealth.currency | 3-letter code | any ISO-4217 | Base currency for wealth figures |
| totalWealth.total | float | ≥0 | Net worth |
| totalWealth.primary_residence | float | ≥0 | Portion of wealth in main home |
| incomeSources[] | list | see sub-table | Ongoing income |
| incomeSources[].category | enum | `Employment`, `Self-Employment`, `Pension`, `Rental`, `Dividends`, etc. | |
| incomeSources[].fields.employer | string | | present when category=Employment |
| incomeSources[].fields.role | string | | |
| incomeSources[].country | string | | Source country |
| incomeSources[].amount | float | ≥0 | Annualised amount |
| incomeSources[].currency | 3-letter code | | |
| incomeSources[].continue_in_destination | bool | | Will income continue after moving? |
| expectedEmployment[] | list | similar shape | Job offers or job search targets |
| liabilities[] | list | see sub-table | Loans, debts |
| liabilities[].category | enum | `Loan`, `Mortgage`, `Credit Card`, `Other` | |
| liabilities[].fields.* | dict | varies | e.g. lender, purpose |
| liabilities[].amount | float | | Outstanding balance |
| liabilities[].currency | 3-letter code | | |
| capitalGains.hasGains | bool | | Any realised gains in current year |
| capitalGains.details[] | list | previous gains | legacy |
| capitalGains.futureSales[] | list | Planned disposals after move |
| futureSales[].asset | string | description |
| futureSales[].type | enum | `Real Estate`, `Stocks/ETFs`, `Crypto`, `Business`, `Collectibles`, `Other` |
| futureSales[].holding_time | enum | `< 12 months (short-term)`, `12 – 24 months`, … | Affects tax rate |
| futureSales[].surplus_value | float | ≥0 | Expected gain |
| futureSales[].currency | 3-letter code | | |
| futureSales[].reason | string | free text | Optional |

## 5. socialSecurityAndPensions
| Field | Type | Allowed Values / Format | Notes |
| currentCountryContributions.isContributing | bool | | Currently paying into system |
| currentCountryContributions.country | string | | Country |
| currentCountryContributions.yearsOfContribution | float | ≥0 | Years paid |
| futurePensionContributions.isPlanning | bool | | Will pay in after move |
| futurePensionContributions.details[] | list | TBD | |
| existingPlans.hasPlans | bool | | Holds pensions already |
| existingPlans.details[] | list | Sub-table |
| details[].planType | string | e.g., `Defined contribution`, `Defined benefit` |
| details[].currency | 3-letter code | | |
| details[].currentValue | float | ≥0 | |
| details[].country | string | | Plan jurisdiction |

## 6. futureFinancialPlans
| Field | Type | Notes |
| plannedInvestments[] | list | Upcoming investments |
| plannedPropertyTransactions[] | list | Planned purchases/sales |
| plannedRetirementContributions[] | list | Extra pension contributions |
| plannedBusinessChanges[] | list | Starting/closing business, etc. |

## 7. taxDeductionsAndCredits
| Field | Type | Notes |
| potentialDeductions[] | list | Each deduction entered by user |
| potentialDeductions[].description | string | free text |
| potentialDeductions[].amount | float | |
| potentialDeductions[].currency | 3-letter code | |

## 8. additionalInformation
| Field | Type | Notes |
| specialSections[] | list | Allow user-defined blocks (markdown) |
| generalNotes | string | Free text |

---

The above completes coverage of all sections currently produced by the Streamlit app. Every field is now documented and ready to be included in the backend translation pipeline. 