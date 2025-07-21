import os
import json
import re
import streamlit as st

def init_session_state():
    if 'currencies' not in st.session_state:
        try:
            # Path to the country info JSON file
            country_info_path = os.path.join("base_recommender", "app_components", "country_info", "country_info.json")
            with open(country_info_path, "r") as f:
                country_data = json.load(f)
            
            # Use a set to avoid duplicate currency codes
            currency_set = set()
            for country, info in country_data.items():
                # Only include currencies where "currency_included" is "yes"
                if info.get("currency_included", "").lower() == "yes":
                    shorthand = info.get("currency_shorthand")
                    if shorthand:
                        currency_set.add(shorthand)
            
            # If we found any currencies, sort them; otherwise fall back to defaults
            if currency_set:
                st.session_state.currencies = sorted(currency_set)
            else:
                st.session_state.currencies = ["USD", "EUR", "GBP"]
        except Exception as e:
            print(f"Error loading currencies: {e}")
            st.session_state.currencies = ["USD", "EUR", "GBP"]

    if 'data' not in st.session_state:
        st.session_state.data = {
            "individual": {
                "personalInformation": {
                    "dateOfBirth": "",
                    "nationalities": [
                        # Example:
                        # {"country": "Germany", "willingToRenounce": False}
                    ],
                    "maritalStatus": "",
                    "enduringMaritalStatusInfo": "",
                    "currentResidency": {
                        "country": "",
                        "status": "",
                        "duration": 0.0  # Years at current residence (for temporary residents)
                    },
                    "relocationPartner": False,
                    "relocationPartnerInfo": {
                        "relationshipType": "",
                        "sameSex": False,  # Changed from string to boolean
                        "fullRelationshipDuration": 0.0,  # Total time in relationship (any type)
                        "officialRelationshipDuration": 0.0,  # Duration of official status:
                        #   - For "Spouse": Years married
                        #   - For "Civil Partner"/"Domestic Partner": Years in official partnership
                        #   - For "Unmarried Partner"/"Common-law Partner"/"Cohabiting Partner": Years living together
                        #   - For "Fiancé(e)": Years engaged
                        #   - For "Conjugal Partner": Years in committed relationship
                        #   - For "Other": Years in official relationship status
                        "partnerNationalities": [
                            # Example:
                            # {"country": "France", "willingToRenounce": False}
                        ],
                    },
                    "numRelocationDependents": 0,
                    "relocationDependents": [
                        {
                            "dateOfBirth": "",
                            "nationalities": [
                                # Example:
                                # {"country": "Italy", "willingToRenounce": False}
                            ],
                            "relationship": "",
                            "isStudent": False
                        }
                    ],
                },
                "education": {
                    "isStudent": False,
                    "currentSchool": "",
                    "currentFieldOfStudy": "",
                    "previousDegrees": [
                        # Example entry:
                        # {
                        #     "degree": "Bachelor of Science",
                        #     "institution": "University of Technology",
                        #     "field": "Computer Science",
                        #     "start_year": "2018",
                        #     "end_year": "2022",
                        #     "in_progress": False
                        # }
                    ],
                    "visaSkills": [
                        # Example entry:
                        # {
                        #     "skill": "Python Development",
                        #     "credential_name": "AWS Certified Developer",
                        #     "credential_institute": "Amazon Web Services"
                        # }
                    ],
                    "interestedInStudying": False,
                    "schoolInterestDetails": "",
                    "learningInterests": [
                        # Example entry:
                        # {
                        #     "skill": "Data Science",
                        #     "status": "planned",  # "planned" or "open"
                        #     "institute": "Tech Bootcamp",
                        #     "months": 6,
                        #     "hours_per_week": 20,
                        #     "funding_status": "Have funds"
                        # }
                    ],
                    "schoolOffers": [
                        # Example entry:
                        # {
                        #     "school": "Technical University Berlin",
                        #     "program": "Master's in Data Science",
                        #     "year": "2024",
                        #     "financial_status": "Have funds"  # Options: "Paid", "Have funds", "Not sure / need scholarship"
                        # }
                    ]
                },
                "residencyIntentions": {
                    "destinationCountry": {
                        "country": "",
                        "region": "",
                        "citizenshipStatus": False,
                        "moveType": "Permanent", # Options: "Permanent", "Temporary", "Digital Nomad"
                        "intendedTemporaryDurationOfStay": 0.0,
                    },
                    "residencyPlans": {
                        "applyForResidency": False,
                        "maxMonthsWillingToReside": 6,
                        "openToVisiting": False
                    },
                    "citizenshipPlans": {
                        "interestedInCitizenship": False,
                        "familyTies": {
                            "hasConnections": False,
                            "closestRelation": ""
                        },
                        "militaryService": {
                            "willing": False,
                            "maxServiceYears": 2
                        },
                        "investment": {
                            "willing": False,
                            "amount": 0,
                            "currency": "USD"
                        },
                        "donation": {
                            "willing": False,
                            "amount": 0,
                            "currency": "USD"
                        }
                    },
                    "languageProficiency": {
                        "individual": {},
                        "partner": {},
                        "dependents": [],
                        "willing_to_learn": [],
                        "can_teach": {},
                        "other_languages": {}
                    },
                    "centerOfLife": {
                        "maintainsSignificantTies": False,
                        "tiesDescription": "",
                    },
                    "moveMotivation": "",
                    "taxCompliantEverywhere": True,               
                },
                "socialSecurityAndPensions": {
                    "currentCountryContributions": {
                        "isContributing": False,
                        "country": "",
                        "yearsOfContribution": 0.0
                    },
                    "futurePensionContributions": {
                        "isPlanning": True,
                        "details": [
                            # Example entry:
                            # {
                            #     "pensionType": "Employer-sponsored plan",  # "Employer-sponsored plan", "Personal retirement account", "National voluntary scheme", "Industry-wide plan", "Cross-border pension", or custom type
                            #     "contributionAmount": 25000.0,
                            #     "currency": "USD",
                            #     "country": "United States"
                            # }
                        ]
                    },
                    "existingPlans": {
                        "hasPlans": False,
                        "details": [
                            # Example entry:
                            # {
                            #     "planType": "Defined benefit plan",  # "Defined benefit plan", "Defined contribution plan", "National social security entitlement", "Portable retirement account", "Annuity contract", "Other"
                            #     "currency": "USD", 
                            #     "currentValue": 150000.0,
                            #     "country": "United States"
                            # }
                        ]
                    }
                },
                "taxDeductionsAndCredits": {
                    "potentialDeductions": [
                        # Example entry for general deductions:
                        # {
                        #     "type": "Charitable Donations",  # "Charitable Donations", "Medical Expenses", "Education Costs", "Work-Related Expenses", "Retirement Contributions", or custom type
                        #     "amount": 5000.0,
                        #     "currency": "USD",
                        #     "country": "United States"
                        # }
                        # 
                        # Example entry for alimony:
                        # {
                        #     "type": "Alimony Paid",  # "Alimony Paid" or "Alimony Received"
                        #     "amount": 24000.0,
                        #     "currency": "USD",
                        #     "country": "United States",
                        #     "date": "2023-01-15",  # ISO format date string
                        #     "notes": "Governed by United States law"
                        # }
                    ]
                },
                "finance": {
                    "totalWealth": {
                        # Example:
                        # {
                        #     "currency": "USD",
                        #     "total": 500000.0,
                        #     "primary_residence": 300000.0
                        # }
                    },
                    "incomeSources": [
                        # Example entry:
                        # {
                        #     "category": "Employment",  # "Employment", "Self-Employment", "Investments", "Rental Income", "Other"
                        #     "fields": {
                        #         "employer": "Tech Corp",
                        #         "role": "Software Engineer"
                        #     },
                        #     "country": "US",
                        #     "amount": 120000.0,
                        #     "currency": "USD",
                        #     "continue_in_destination": True
                        # }
                    ],
                    "expectedEmployment": [
                        # Note: This array exists in schema but no corresponding function in finance.py
                        # May be legacy code - keeping for compatibility
                    ],
                    "liabilities": [
                        # Example entry:
                        # {
                        #     "category": "Mortgage",  # "Mortgage", "Loan", "Credit Card", "Other"
                        #     "fields": {
                        #         "property_description": "Primary residence",
                        #         "property_type": "Residential"
                        #     },
                        #     "country": "US",
                        #     "amount": 250000.0,
                        #     "currency": "USD",
                        #     "payback_years": 25.0,      # Years until fully paid off
                        #     "interest_rate": 3.5        # Annual interest rate percentage
                        # }
                    ],
                    "capitalGains": {
                        "hasGains": False,
                        "details": [],
                        "futureSales": [
                            # Example entry:
                            # {
                            #     "asset": "Apple Stock",
                            #     "type": "Stocks/ETFs",
                            #     "holding_time": "2 – 3 years",
                            #     "surplus_value": 15000.0,
                            #     "currency": "USD",
                            #     "reason": "Need cash for relocation"
                            # }
                        ]
                    },
                    # Note: The following assets structure is not used in current finance.py
                    "assets": {
                        "realEstate": [],
                        "financial": [],
                        "taxAdvantagedAccounts": [],
                        "cryptocurrency": []
                    }
                },
                "futureFinancialPlans": {
                    "plannedInvestments": [
                        # Example entry:
                        # {
                        #     "type": "Stocks",  # "Stocks", "Bonds", "Real Estate", "Cryptocurrency", "Mutual Funds", or custom type
                        #     "country": "United States",
                        #     "estimatedValue": 50000.0
                        # }
                    ],
                    "plannedPropertyTransactions": [
                        # Example entry:
                        # {
                        #     "transactionType": "Buy",  # "Buy", "Sell", "Rent Out"
                        #     "country": "Canada",
                        #     "estimatedValue": 400000.0
                        # }
                    ],
                    "plannedRetirementContributions": [
                        # Example entry:
                        # {
                        #     "accountType": "401(k)",  # "401(k)", "IRA/Roth IRA", "Pension Plan", or custom type
                        #     "country": "United States",
                        #     "contributionAmount": 20000.0
                        # }
                    ],
                    "plannedBusinessChanges": [
                        # Example entry:
                        # {
                        #     "changeType": "Start New Business",  # "Start New Business", "Sell Existing Business", "Expand Business to Another Country"
                        #     "country": "Germany",
                        #     "estimatedValueImpact": 100000.0
                        # }
                    ]
                },
                "additionalInformation" : {
                    "specialSections": [
                        # Example entry:
                        # {
                        #     "theme": "Special Circumstances",
                        #     "content": "Detailed explanation of unique situation...",
                        #     "dateAdded": "2024-01-15",      # ISO date string
                        #     "dateUpdated": "2024-02-01"     # ISO date string (optional)
                        # }
                    ],
                    "generalNotes": ""
                },
            }
        }

