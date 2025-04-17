import streamlit as st
from app_components.helpers import (
    update_data, get_data, display_section)

def additional_information(anchor):
    """
    Additional Information Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"📝 {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Additional information helps:**
        - Provide context for unique circumstances not covered in standard sections
        - Document special considerations for your international relocation
        - Highlight specific concerns that may affect your tax or immigration status
        - Record important details that immigration officials should know
        - Address potential complications in your application process
        - Ensure all relevant information is considered in your assessment
        """)

    # ======================= SPECIAL SECTIONS =======================
    st.subheader("🔖 Special Information Sections")
    st.caption("Add any additional information that doesn't fit in other sections")
    
    # DATA INITIALIZATION PATTERN
    special_sections = get_data("individual.additionalInformation.specialSections") or []
    
    # -------------------- ADD NEW ITEM PATTERN --------------------
    with st.expander("➕ Add Special Information Section"):
        with st.form("add_special_section"):
            theme = st.text_input(
                "Theme/Title",
                help="Enter a descriptive title for this information section")
                
            content = st.text_area(
                "Content",
                height=150,
                help="Provide detailed information about this special circumstance")
            
            # CONSISTENT FORM SUBMISSION PATTERN
            submitted = st.form_submit_button("💾 Add Section")
            if submitted and theme and content:
                special_sections.append({
                    "theme": theme, 
                    "content": content,
                    "dateAdded": st.session_state.get("current_date", "")
                })
                update_data("individual.additionalInformation.specialSections", special_sections)
                st.rerun()
    
    # -------------------- DISPLAY ITEMS PATTERN --------------------
    if special_sections:
        for idx, section in enumerate(special_sections):
            with st.expander(f"Section {idx + 1}: {section['theme']}"):
                # SPLIT CONTENT AND ACTIONS
                col1, col2 = st.columns([0.8, 0.2])
                with col1:
                    st.write(section['content'])
                    if section.get('dateAdded'):
                        st.caption(f"Added on: {section['dateAdded']}")
                
                with col2:
                    # CONSISTENT REMOVAL PATTERN
                    if st.button("❌ Remove", key=f"remove_section_{idx}"):
                        del special_sections[idx]
                        update_data("individual.additionalInformation.specialSections", special_sections)
                        st.rerun()
                    
                    # EDIT BUTTON
                    if st.button("✏️ Edit", key=f"edit_section_{idx}"):
                        st.session_state[f"edit_section_{idx}"] = True
                        st.rerun()
                
                # CONDITIONAL EDIT FORM
                if st.session_state.get(f"edit_section_{idx}", False):
                    with st.form(f"edit_form_{idx}"):
                        updated_theme = st.text_input(
                            "Update Theme/Title", 
                            value=section['theme'])
                        updated_content = st.text_area(
                            "Update Content", 
                            value=section['content'],
                            height=150)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            save = st.form_submit_button("💾 Save Changes")
                        with col2:
                            cancel = st.form_submit_button("❌ Cancel")
                        
                        if save and (updated_theme and updated_content):
                            special_sections[idx]['theme'] = updated_theme
                            special_sections[idx]['content'] = updated_content
                            special_sections[idx]['dateUpdated'] = st.session_state.get("current_date", "")
                            update_data("individual.additionalInformation.specialSections", special_sections)
                            st.session_state[f"edit_section_{idx}"] = False
                            st.rerun()
                        
                        if cancel:
                            st.session_state[f"edit_section_{idx}"] = False
                            st.rerun()
    else:
        st.info("ℹ️ No special information sections added yet. Use the form above to add important details.")
    
    # ======================= GENERAL NOTES SECTION =======================
    st.subheader("📒 General Notes")
    
    general_notes = st.text_area(
        "Additional notes or comments",
        value=get_data("individual.additionalInformation.generalNotes") or "",
        height=150,
        help="Enter any general notes that don't require a separate section")
    update_data("individual.additionalInformation.generalNotes", general_notes)
    
    # ======================= SECTION SUMMARY =======================
    state = get_data("individual.additionalInformation")
    display_section("individual.additionalInformation", state)
    
