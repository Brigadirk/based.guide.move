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

def get_country_regions(country: str) -> list[str] | None:
    """Get list of regions for a given country.
    
    Args:
        country: Name of the country to get regions for
        
    Returns:
        List of regions including "I don't know" if regions exist, None if no regions
    """
    # Path to the country_info JSON file
    country_info_path = Path(
        "./base_recommender/app_components/country_info/country_info.json")

    # Load country info from the JSON file
    if country_info_path.exists():
        with open(country_info_path, "r") as f:
            country_info = json.load(f)
    else:
        raise FileNotFoundError(f"{country_info_path} does not exist.")

    # Get regions for the country
    if country not in country_info:
        return None
        
    regions = country_info[country].get("regions")
    if not regions:
        return None

    # Handle different region formats
    if isinstance(regions, list):
        region_list = regions
    elif isinstance(regions, dict):
        # For nested structures like US with States/Territories or
        # countries with region-specific languages
        region_list = []
        for key, value in regions.items():
            if isinstance(value, list):
                # For cases where regions is a dict mapping directly to language lists
                region_list.append(key)
            elif isinstance(value, dict):
                # For nested structures like US
                region_list.extend(value)

    # Add "I don't know" option
    region_list.insert(0, "I don't know yet")
    
    return region_list

def get_languages(country: str, region: str | None = None) -> dict[str, list[str]]:
    """Get languages for a country and optionally a specific region.
    
    Args:
        country: Name of the country
        region: Optional name of the region within the country
        
    Returns:
        Dictionary with keys 'country_languages' and optionally 'region_languages'
        containing lists of languages. Returns empty dict if country not found.
    """
    # Path to the country_info JSON file
    country_info_path = Path(
        "./base_recommender/app_components/country_info/country_info.json")

    # Load country info from the JSON file
    if country_info_path.exists():
        with open(country_info_path, "r") as f:
            country_info = json.load(f)
    else:
        raise FileNotFoundError(f"{country_info_path} does not exist.")

    # Initialize result dictionary
    result = {}
    
    # Get country info
    if country not in country_info:
        return result
    
    country_data = country_info[country]
    
    # Get country-level languages
    result["country_languages"] = country_data.get("dominant_language", [])
    
    # If region specified, try to get region-specific languages
    if region and region != "I don't know yet":
        regions = country_data.get("regions", {})
        
        # Handle different region formats
        if isinstance(regions, dict):
            # For countries with region-specific languages
            if region in regions:
                region_langs = regions[region]
                if isinstance(region_langs, list):
                    result["region_languages"] = region_langs
                elif isinstance(region_langs, dict) and "languages" in region_langs:
                    result["region_languages"] = region_langs["languages"]
        
    return result

def get_language_proficiency_levels():
    """Returns standardized language proficiency levels."""
    return {
        1: "Basic/Beginner (A1)",
        2: "Elementary (A2)",
        3: "Intermediate (B1-B2)",
        4: "Advanced (C1)",
        5: "Native/Bilingual (C2)"
    }

def display_section(section_key, section_name):

    state = get_data(section_key)

    # Initialize visibility state in session_state if not already set
    if f"{section_key}_visible" not in st.session_state:
        st.session_state[f"{section_key}_visible"] = False

    cols = st.columns([3,2,3])

    with cols[1]:
        # Toggle visibility state when button is pressed
        if st.button(f"View {section_name} state", key=f"toggle_{section_key}"):
            st.session_state[f"{section_key}_visible"] = not st.session_state[f"{section_key}_visible"]

    # Display or hide JSON based on visibility state
    if st.session_state[f"{section_key}_visible"]:
        st.json(json.dumps(state, indent=2))
