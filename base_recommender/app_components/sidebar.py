import streamlit as st
from PIL import Image
from streamlit_scroll_navigation import scroll_navbar

def display_sidebar():
    """Display the sidebar with navigation and image."""
    with st.sidebar:
        st.title("Mr. Pro Bonobo")
        image = Image.open("./base_recommender/app_components/images/ape.png")
        st.image(image, use_container_width=True)

        headers = [
            "Information",
            "Destination",
            "Personal Information",
            "Residency Intentions",
            "Employment Information",
            "Assets",
            "Tax Compliance History",
            "Social Security & Pensions",
            "Tax Deductions and Credits",
            "Future Financial Plans",
            "Partner Information",
            "Additional Information",
            "Review & Export"
        ]

        icons = [
            "lightbulb", "airplane", "person", "bank", "briefcase", "file-earmark-text",
            "shield-check", "calculator", "graph-up-arrow", 
            "people", "info-circle", "download"
        ]

        # Correct usage without unsupported 'selected' parameter
        scroll_navbar(
            anchor_ids=headers,
            anchor_labels=headers,
            anchor_icons=icons,
            orientation='vertical',
            key="main_navbar"
        )
