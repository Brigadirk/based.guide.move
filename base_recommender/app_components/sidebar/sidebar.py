import streamlit as st
from PIL import Image
from streamlit_scroll_navigation import scroll_navbar

def display_sidebar():
    """Display the sidebar with navigation and image."""
    with st.sidebar:
        st.title("Mr. Pro Bonobo")
        image = Image.open("./base_recommender/app_components/images/ape.png")
        st.image(image, use_container_width=True)

        headers = {
            'Disclaimer': 'lightbulb',
            'Desired Destination': 'globe',
            'Personal Information': 'person',
            'Education': 'book',
            'Residency Intentions': 'airplane',
            'Income and Assets': 'bank',
            'Social Security and Pensions': 'briefcase',
            'Tax Deductions and Credits': 'calculator',
            'Future Financial Plans': 'graph-up-arrow',
            'Additional Information': 'info-circle',
            'Review and Export': 'download'
            }

        # Correct usage without unsupported 'selected' parameter
        scroll_navbar(
            anchor_ids=list(headers.keys()),
            anchor_labels=list(headers.keys()),
            anchor_icons=list(headers.values()),
            orientation='vertical',
            key="main_navbar"
        )
