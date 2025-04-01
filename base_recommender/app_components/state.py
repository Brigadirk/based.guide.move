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
                    }
                },
                "employmentInformation": {
                    "status": {
                        "currentStatus": "",  
                        "seekingEmployment": False  
                    },
                    "selfEmployment": {
                        "businessType": "",  
                        "sector": "",  
                        "yearsSelfEmployed": 0 
                    },
                    "corporateOwnership": {
                        "companyName": "",  
                        "industry": "", 
                        "numEmployees": 0,  
                        "relocatingBusiness": "" 
                    },
                    "jobOffer": {
                        "hasOffer": False,  
                        "offerEmployer": "",  
                        "offerJobTitle": ""  
                    },
                    "incomeSources": [  
                    {
                        "employerName": "",  
                        "jobTitle": "", 
                        "responsibilities": "",  
                        "employmentDuration": 0,  
                        "employmentConstruction": "", 
                        "incomeSourceCountry": "",  
                        "benefits": "", 
                        "annualIncome": {
                        "amount": 0.0,  
                        "currency": "", 
                        "paidInCryptoCurrency": False 
                        }
                    }
                    ],
                    "totalCompensation": {
                        "amount": 0.0,  
                        "currency": ""  
                    },
                    "retirement": {
                    "retirementIncome": {
                        "amount": 0.0, 
                        "currency": "" 
                    }
                    },
                    "alimonyPayments": { 
                    "amount": 0.0,   
                    "currency": ""   
                    }
                },
                "assetInformation": {
                    "assets": {
                        "realEstate": [],
                        "securities": [],
                        "crypto": [],
                        "businesses": [],
                        # Tax-specific containers
                        "capitalGainsData": {
                            "realEstateSales": [],
                            "securitySales": [],
                            "cryptoSales": [],
                            "businessSales": []
                        },
                        "incomeStreams": {
                            "rentalProperties": [],
                            "dividendStocks": [],
                            "stakingAssets": [],
                            "businessDistributions": []
                        }
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
                        }
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
                "taxDeductionsAndCredits": {
                    "potentialDeductions": [
                    ]
                }
            }
        }
