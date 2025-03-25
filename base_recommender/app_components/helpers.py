import streamlit as st
import json
from pathlib import Path

def get_data(path, default=None):
    """Get value from nested dictionary using a path string."""
    parts = path.split('.')
    d = st.session_state.data
    for part in parts:
        if part.isdigit():
            part = int(part)
        if part not in d:
            return default
        d = d[part]
    return d

def update_data(path, value):
    """Update nested dictionary using a path string."""
    parts = path.split('.')
    d = st.session_state.data
    for part in parts[:-1]:
        if part.isdigit():
            part = int(part)
        if part not in d:
            d[part] = {}
        d = d[part]
    d[parts[-1]] = value

def navigate_to(header):
    """Navigate to a specific header."""
    st.session_state.current_header = header

def get_country_list():
    """Get country information from the country_info JSON file."""

    # Path to the country_info JSON file
    country_info_path = Path(
        "./base_recommender/app_components/country_info/country_info.json")

    # Load ALL_COUNTRIES_AND_CURRENCIES from the JSON file
    if country_info_path.exists():
        with open(country_info_path, "r") as f:
            all_countries_and_currencies = json.load(f)
    else:
        raise FileNotFoundError(f"{country_info_path} does not exist.")

    # Generate ALL_COUNTRIES by filtering the dictionary
    countries = [
        key for key, value in all_countries_and_currencies.items()
        if value.get("embedding_name") != "not-included"
    ]

    return countries