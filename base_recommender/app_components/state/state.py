import os
import json
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
                    },
                    "relocationPartner": False,
                    "relocationPartnerInfo": {
                        "relationshipType": "",
                        "sameSex": "",
                        "fullRelationshipDuration": 0.0,
                        "officialRelationshipDuration": 0.0,
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
                    "previousEducation": "",
                    "interestedInStudying": False,  # renamed and clarified
                    "schoolInterestDetails": "",
                    "schoolOffers": [],             # now a list of offers
                    "visaTaxRelevance": ""
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
    else:
        # PATCH: Ensure new education fields exist
        edu = st.session_state.data["individual"].setdefault("education", {})
        if "isStudent" not in edu:
            edu["isStudent"] = False
        if "currentSchool" not in edu:
            edu["currentSchool"] = ""
        if "previousEducation" not in edu:
            edu["previousEducation"] = ""
        if "interestedInStudying" not in edu:
            edu["interestedInStudying"] = False
        if "schoolInterestDetails" not in edu:
            edu["schoolInterestDetails"] = ""
        if "schoolOffers" not in edu:
            edu["schoolOffers"] = []
        if "visaTaxRelevance" not in edu:
            edu["visaTaxRelevance"] = ""