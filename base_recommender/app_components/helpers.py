import streamlit as st
import json
from pathlib import Path
import re

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

    # -------------------- AUDIT SUPPORT --------------------
    # Record every path that gets updated so we can later
    # verify that each leaf in the session-state schema
    # is touched by at least one component.
    updated = st.session_state.setdefault("_updated_paths", set())
    updated.add(path)

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

# ---------------------------------------------------------------------
# TEXT SUBSTITUTION UTILITIES
# ---------------------------------------------------------------------

# ---------- First-person conversion (inputs only) ----------
# We only convert when the *prompt begins* with these phrases, so
# mid-sentence occurrences like "describe your motivation ..." stay intact.
_FP_REPLACEMENTS = [
    (r"^(?:[Aa]re)\s+you\b",            "I am"),
    (r"^(?:[Dd]o)\s+you\s+have\b",      "I have"),
    (r"^(?:[Dd]o)\s+you\b",             "I"),
    (r"^(?:[Ww]ill)\s+you\b",           "I will"),
    (r"^(?:[Hh]ave)\s+you\b",           "I have"),
    (r"^(?:[Yy]our)\b",                 "My"),
    (r"^(?:[Yy]ou)\b",                  "I"),
]
_FP_CACHE: dict[str, str] = {}

def _to_first_person(text: str) -> str:
    if text in _FP_CACHE:
        return _FP_CACHE[text]
    converted = text
    for pat, repl in _FP_REPLACEMENTS:
        converted = re.sub(pat, repl, converted)
    if converted.strip().endswith("?"):
        converted = converted.rstrip(" ?") + "."
    _FP_CACHE[text] = converted
    return converted

# ---------- Destination insertion (all widgets) ----------
_DEST_CACHE: dict[str, str] = {}

# ---------------------------------------------------------------------
# Countries that conventionally take the definite article
# (source: English style-guides and quick scan of country_info.json)
# ---------------------------------------------------------------------
_COUNTRIES_WITH_ARTICLE = {
    "Netherlands",
    "United States",
    "United Kingdom",
    "Philippines",
    "Czech Republic",
    "Dominican Republic",
    "United Arab Emirates",
    "Central African Republic",
    "Democratic Republic of the Congo",
    "Republic of the Congo",
    "Maldives",
    "Seychelles",
    "Gambia",
    "Bahamas",
}

def format_country_name(country: str | None) -> str:
    """Return 'the X' for countries that need an article."""
    if not country:
        return ""
    return f"the {country}" if country in _COUNTRIES_WITH_ARTICLE else country

def _destination_full() -> str | None:
    """Return 'Region, Country' or 'Country' (cached)."""
    key = "dest_full"
    if key in _DEST_CACHE:
        return _DEST_CACHE[key]

    country = get_data("individual.residencyIntentions.destinationCountry.country")
    if not country:
        return None
    region  = get_data("individual.residencyIntentions.destinationCountry.region")
    country_fmt = format_country_name(country)
    full = f"{region}, {country_fmt}" if region and region != "I don't know" else country_fmt
    _DEST_CACHE[key] = full
    return full

# ---------- Widget patch factory ----------
def _patch_widget(method_name: str, first_person: bool):
    original = getattr(st, method_name)
    def wrapper(*args, **kwargs):
        if args and isinstance(args[0], str):
            txt = args[0]
            if first_person:
                txt = _to_first_person(txt)
            args = (txt, *args[1:])
        return original(*args, **kwargs)
    return wrapper

# ---------- Apply patches once ----------
if not hasattr(st, "_text_sub_patched"):
    INPUT_WIDGETS = [
        "checkbox", "radio", "selectbox", "select_slider",
        "slider", "number_input", "text_input", "text_area",
    ]
    ALL_WIDGETS = INPUT_WIDGETS + [
        "subheader", "caption", "markdown", "info",
        "warning", "success", "error",
    ]
    for w in ALL_WIDGETS:
        if hasattr(st, w):
            setattr(
                st,
                w,
                _patch_widget(w, first_person=(w in INPUT_WIDGETS))
            )
    st._text_sub_patched = True
