import os
import json
import tempfile
from app_components.helpers import (
    get_country_list, get_data, update_data, display_section)
import streamlit as st

def display_review_export(anchor):
    st.header(anchor, anchor=anchor)  
    display_section("individual", "Review and Export")    
    st.divider()

    # Save the JSON data to a temporary folder
    temp_dir = tempfile.gettempdir()

    temp_dir = "base_recommender/temp_profiles/extensive"
    json_data = get_data("individual")
    json_file_path = os.path.join(temp_dir, "individual_data.json")

    with open(json_file_path, 'w') as json_file:
        json.dump(json_data, json_file, indent=4)

    st.success(f"Data has been saved to {json_file_path}")

    # -------------------- DOWNLOAD BUTTON --------------------
    st.download_button(
        "⬇️ Download my JSON",
        data=json.dumps(json_data, indent=2),
        file_name="tax_migration_profile.json",
        mime="application/json",
        help="Save a copy of your answers."
    )