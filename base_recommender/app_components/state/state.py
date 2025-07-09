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
                    "currentFieldOfStudy": "",
                    "previousDegrees": [
                        # Example entry:
                        # {
                        #     "degree": "Bachelor of Science",
                        #     "institution": "University of Technology",
                        #     "field": "Computer Science",
                        #     "year": "2020"
                        # }
                    ],
                    "visaSkills": [
                        # Example entry:
                        # {
                        #     "skill": "Python Development",
                        #     "credentials": True,
                        #     "credential_name": "AWS Certified Developer",
                        #     "credential_institute": "Amazon Web Services"
                        # }
                    ],
                    "interestedInStudying": False,
                    "schoolInterestDetails": "",
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

# ==========================================================
#  UTILITIES FOR STATE AUDITING
# ==========================================================
def _list_leaf_paths(node, prefix=""):
    """Return every leaf-node path in dot-notation."""
    paths = []
    if isinstance(node, dict):
        for k, v in node.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            paths.extend(_list_leaf_paths(v, new_prefix))
    elif isinstance(node, list):
        # Treat list element indices as literal digits (0,1,2…)
        for i, v in enumerate(node):
            new_prefix = f"{prefix}.{i}" if prefix else str(i)
            paths.extend(_list_leaf_paths(v, new_prefix))
    else:  # primitive leaf
        paths.append(prefix)
    return paths

def audit_state(prune: bool = False):
    """
    1. Confirm that every leaf path in st.session_state.data
       was updated by *some* component.
    2. Optionally delete "orphan" keys that were never updated.
    """
    updated = st.session_state.get("_updated_paths", set())
    all_leaves = set(_list_leaf_paths(st.session_state.data))

    missing_updates = sorted(all_leaves - updated)
    # Helper: does the *dot-path* exist anywhere in the schema?
    # Treat containers (dict / list nodes) as valid – they may legitimately be
    # updated even when they contain no leaf values yet.
    def _path_exists_in_schema(path: str) -> bool:
        node = st.session_state.data
        for key in path.split("."):
            if isinstance(node, dict):
                node = node.get(key)
            elif isinstance(node, list) and key.isdigit():
                idx = int(key)
                if idx >= len(node):
                    return False
                node = node[idx]
            else:
                return False
            if node is None:
                return False
        return True

    orphan_paths = []
    for p in updated - all_leaves:
        # Skip if p is an ancestor of any real leaf OR if the exact path exists
        # in the schema (even as an empty container).
        if any(l.startswith(f"{p}.") for l in all_leaves) or _path_exists_in_schema(p):
            continue
        orphan_paths.append(p)

    if missing_updates:
        # ---------- build a readable tree ----------
        from collections import defaultdict

        def _pretty(token: str) -> str:
            """snake_orCamelCase → Title Case; digit -> #n"""
            if token.isdigit():
                return f"#{int(token)+1}"
            token = token.replace("_", " ")
            token = re.sub(r"([a-z])([A-Z])", r"\1 \2", token)
            return token.capitalize()

        tree: dict[str, list[str]] = defaultdict(list)
        for path in missing_updates:
            parts = path.split(".")
            if parts and parts[0] == "individual":
                parts = parts[1:]
            if not parts:
                continue
            section = _pretty(parts[0])
            field   = " – ".join(_pretty(p) for p in parts[1:]) or "_"
            tree[section].append(field)

        # ---------- display ----------
        # Use collapsible <details> blocks for a tidier, more approachable list
        warn_box = st.warning("", icon="⚠️")  # yellow call-out container

        with warn_box:
            # Header
            st.markdown(
                f"<h4 style='margin-top:0'>🚧 You still have "
                f"<strong>{len(missing_updates)}</strong> unanswered fields:</h4>",
                unsafe_allow_html=True,
            )

            for section in sorted(tree):
                # Sanitise section name for potential anchor linking elsewhere
                anchor = re.sub(r"[^a-z0-9]+", "-", section.lower()).strip("-")

                # Build the HTML list of fields for this section
                items_html = "".join(
                    f"<li>{field}</li>" for field in sorted(tree[section])
                )

                # One collapsible block per section
                section_html = (
                    f"<details>"
                    f"<summary><strong>{section}</strong></summary>"
                    f"<ul style='margin-top:0.25rem'>{items_html}</ul>"
                    f"</details>"
                )
                st.markdown(section_html, unsafe_allow_html=True)

    if orphan_paths:
        st.error(
            "🔥 Some paths were updated but are not present in the schema:"
            + "\n".join(orphan_paths)
        )

    if prune and missing_updates:
        for path in missing_updates:
            # Walk to the parent dict and delete the key
            keys = path.split(".")
            ref  = st.session_state.data
            for k in keys[:-1]:
                ref = ref[int(k) if k.isdigit() else k]
            ref.pop(int(keys[-1]) if keys[-1].isdigit() else keys[-1], None)
        st.info("🧹 Orphan leaf paths pruned from session state.")
