"""EU citizenship and movement utilities for the backend."""

import json
import os
from typing import Any


# Load EU countries list
def load_eu_countries() -> list[str]:
    """Load the list of EU countries from the data file."""
    try:
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        with open(os.path.join(data_dir, 'eu-countries.json')) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Fallback list if file not found
        return [
            "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
            "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
            "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
            "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
            "Slovenia", "Spain", "Sweden"
        ]

# Cache the EU countries list
EU_COUNTRIES = load_eu_countries()

def is_eu_country(country: str) -> bool:
    """Check if a country is an EU member state."""
    return country in EU_COUNTRIES

def has_eu_citizenship(nationalities: list[dict[str, Any]]) -> bool:
    """Check if user has EU citizenship."""
    if not nationalities:
        return False

    return any(
        nat.get("country") and is_eu_country(nat["country"])
        for nat in nationalities
    )

def get_user_eu_countries(nationalities: list[dict[str, Any]]) -> list[str]:
    """Get EU countries from user's nationalities."""
    if not nationalities:
        return []

    return [
        nat["country"] for nat in nationalities
        if nat.get("country") and is_eu_country(nat["country"])
    ]

def can_move_within_eu(user_nationalities: list[dict[str, Any]], destination_country: str) -> bool:
    """Check if both user has EU citizenship AND destination is EU."""
    return has_eu_citizenship(user_nationalities) and is_eu_country(destination_country)

def get_all_eu_countries() -> list[str]:
    """Get the list of all EU countries."""
    return EU_COUNTRIES.copy()
