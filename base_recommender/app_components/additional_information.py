import streamlit as st
from app_components.helpers import update_data, get_data

def additional_information():
    """Render the Additional Information section."""
    # st.header("Additional Information")
    
    dependents = get_data("additionalInformation.dependents", [])
    
    with st.expander("Add Dependent"):
        with st.form("add_dependent"):
            name = st.text_input("Dependent's Name")
            relationship = st.text_input("Relationship")
            age = st.number_input("Age", min_value=0)
            
            submitted = st.form_submit_button("Add Dependent")
            if submitted and name:
                dependents.append({"name": name, "relationship": relationship, "age": age})
                update_data("additionalInformation.dependents", dependents)
    
    if dependents:
        for dependent in dependents:
            st.write(dependent)
