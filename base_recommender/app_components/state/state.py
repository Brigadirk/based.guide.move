import os
import json
import streamlit as st

def init_session_state():
    if 'currencies' not in st.session_state:
        try:
            exchange_rates_dir = os.path.join('./base_recommender/app_components/exchange_rate_fetcher', 'exchange_rates')
            json_files = [f for f in os.listdir(exchange_rates_dir) if f.endswith('.json')]
            
            if json_files:
                with open(os.path.join(exchange_rates_dir, json_files[0]), 'r') as f:
                    rates_data = json.load(f)
                    currencies = list(rates_data['rates'].keys())
                    st.session_state.currencies = sorted(currencies)
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
                    "nationalities": [],
                    "maritalStatus": "",
                    "enduringMaritalStatusInfo": "",
                    "currentResidency": {
                        "country": "",
                        "status": "",
                        "duration": 0.0,
                    },
                    "relocationPartner": False,
                    "relocationPartnerInfo": {
                        "relationshipType": "",
                        "sameSex": "",
                        "fullRelationshipDuration": 0.0,
                        "officialRelationshipDuration": 0.0,
                        "partnerNationalities": [],
                    },
                    "numRelocationDependents": 0,
                    "relocationDependents": [
                        {
                            "dateOfBirth": "",
                            "nationalities": [],
                            "relationship": "",
                            "isStudent": ""
                        }
                    ],
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
                    }
                },
                "taxComplianceHistory": {
                    "residencyHistory": [
                        {
                        "country": "",
                        "dates": {
                            "start": "",
                            "end": ""
                        },
                        "taxStatus": "",
                        "taxIdentificationNumber": "",
                        "primaryTaxResidence": False,
                        "compliance": {
                            "returnsFiled": False,
                            "audits": [],
                            "treatyClaims": [],
                            "outstandingLiabilities": 0.0
                        }
                        }
                    ],
                    "disclosurePrograms": {
                        "streamlinedProcedures": False,
                        "ovdiParticipation": False,
                        "otherDisclosures": []
                    },
                    "internationalDisclosures": {
                        "fbarFilings": {
                        "hasFiled": False,
                        "yearsFiled": []
                        },
                        "form8938Filings": {
                        "hasFiled": False,
                        "yearsFiled": []
                        },
                        "foreignEntityCompliance": True,
                        "foreignEntities": {},
                    },
                    "auditHistory": [
                        {
                        "year": 0,
                        "jurisdiction": "",
                        "type": "",
                        "result": ""
                        }
                    ]
                },
                "socialSecurityAndPensions": {
                    "currentCountryContributions": {
                        "isContributing": False,
                        "country": "",
                        "yearsOfContribution": 0.0
                    },
                    "futurePensionContributions": {
                        "isPlanning": True,
                        "details": []
                    },
                    "existingPlans": {
                        "hasPlans": False,
                        "details": []
                    }
                },
                "taxDeductionsAndCredits": {
                    "potentialDeductions": [
                    ]
                },
                "finance": {
                    "incomeSources": [
                        # Example entry:
                        # {
                        # "type": "Employment",
                        # "employer": "Tech Corp",
                        # "role": "Software Engineer",
                        # "country": "US",
                        # "currency": "USD",
                        # "annual_income": 120000,
                        # "start_date": "2020-01-01",
                        # "remote": True,
                        # "continue_in_destination": True,
                        # "status": "Current"  # or "Job Offer", "Future Search"
                        # }
                    ],
                    "expectedEmployment": [
                        # Example:
                        # {
                        #   "country": "DE",
                        #   "employer": "EuroTech",
                        #   "role": "Lead Developer",
                        #   "salary": 80000,
                        #   "currency": "EUR",
                        #   "hours_per_week": 40,
                        #   "is_real_offer": True,  # True if real offer, False if estimate
                        #   "notes": "Offer valid until June 2025"
                        # }
                    ],
                    "assets": {
                        "realEstate": [],
                        "financial": [],
                        "taxAdvantagedAccounts": [],
                        "cryptocurrency": []
                    },
                    "liabilities": [],
                    "capitalGains": {
                        "hasGains": False,
                        "details": []
                    }
                },
                "additionalInformation" : {
                    "specialSections": [],
                    "generalNotes": ""
                },
            }
        }