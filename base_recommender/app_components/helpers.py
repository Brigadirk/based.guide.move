import streamlit as st
import json
from pathlib import Path

def get_data(path: str):
    """
    Retrieve data from the session state using a dot-notation path.
    Returns None if the path doesn't exist.
    """
    keys = path.split('.')
    data = st.session_state.data
    
    for key in keys:
        if isinstance(data, dict) and key in data:
            data = data[key]
        elif isinstance(data, list) and key.isdigit() and int(key) < len(data):
            data = data[int(key)]
        else:
            return None
    
    return data

def update_data(path, value):
    keys = path.split('.')
    data = st.session_state.data
    for key in keys[:-1]:
        if key.isdigit():
            key = int(key)
        if key not in data:
            raise KeyError(f"Field '{key}' not in state")
        data = data[key]
    if keys[-1] not in data:
        raise KeyError(f"Field '{keys[-1]}' not in state")
    data[keys[-1]] = value

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