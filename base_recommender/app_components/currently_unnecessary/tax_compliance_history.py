import streamlit as st
from app_components.helpers import (
    update_data, get_data, get_country_list, display_section)
from datetime import datetime
import json

def tax_compliance_history(anchor):
    """
    Tax Compliance History Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"📊 {anchor}", anchor=anchor, divider="rainbow")

    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Understanding your tax compliance history helps:**
        - Determine potential audit risks in your destination country
        - Identify disclosure requirements for past tax arrangements
        - Ensure proper reporting of international assets and accounts
        - Establish tax residency status across multiple jurisdictions
        - Prepare for potential tax treaty claims and benefits
        - Address any outstanding tax liabilities before relocating
        """)

    # ======================= RESIDENCY HISTORY SECTION =======================
    residency_history_section()
    
    # ======================= DISCLOSURE PROGRAMS SECTION =======================
    disclosure_programs_section()
    
    # ======================= INTERNATIONAL DISCLOSURES SECTION =======================
    international_disclosures_section()
    
    # ======================= AUDIT HISTORY SECTION =======================
    audit_history_section()
                    
    # ======================= SECTION SUMMARY =======================
    display_section("individual.taxComplianceHistory", "Tax Compliance History")      
    
    # VISUAL SECTION SEPARATOR
    st.divider()
    return filled_in_correctly(get_data("individual.taxComplianceHistory"))

def residency_history_section():
    """Handle tax residency history with data binding"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("🏠 Tax Residency History")
    st.caption("Record countries where you've been a tax resident in the past 5 years")
    
    # INFORMATION EXPANDER PATTERN
    with st.expander("📚 Understanding Tax Residency"):
        st.markdown("""
        **Tax residency is determined differently in each country, but common factors include:**
        
        - **Physical presence**: Often 183+ days in a calendar year
        - **Permanent home**: Location of your primary residence
        - **Habitual abode**: Where you regularly live
        - **Citizenship/nationality**: Some countries tax based on citizenship (e.g., US)
        
        Most countries will consider you a tax resident if you meet their specific criteria, potentially 
        subjecting you to taxation on your worldwide income in multiple jurisdictions simultaneously.
        """)
    
    # DATA INITIALIZATION PATTERN
    residency_history = get_data("individual.taxComplianceHistory.residencyHistory") or []
    
    # -------------------- ADD NEW ITEM PATTERN --------------------
    with st.expander("➕ Add Tax Residency Period"):
        with st.form("add_residency"):
            col1, col2 = st.columns(2)
            with col1:
                country = st.selectbox(
                    "Country", 
                    options=[""] + get_country_list(), 
                    index=0,
                    help="Select the country where you were a tax resident")
                
                start_date = st.date_input(
                    "Residency Start Date",
                    value=None,
                    help="When your tax residency began")
                
                tax_status = st.selectbox(
                    "Tax Status", 
                    ["Resident", "Non-Resident", "Domiciled", "Deemed Resident"],
                    help="Your official tax classification in this country")
            
            with col2:
                end_date = st.date_input(
                    "Residency End Date",
                    value=None,
                    help="When your tax residency ended (leave blank if current)")
                
                tax_number = st.text_input(
                    "Local Tax ID Number",
                    help="Your tax identification number in this country")
                
                primary_tax = st.checkbox(
                    "Primary Tax Residence",
                    help="Check if this was your main tax residence")

            submitted = st.form_submit_button("💾 Add Residency Period")
            if submitted and country and start_date:
                new_residency = {
                    "country": country,
                    "dates": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat() if end_date else None
                    },
                    "taxStatus": tax_status,
                    "taxIdentificationNumber": tax_number,
                    "primaryTaxResidence": primary_tax,
                    "compliance": {
                        "returnsFiled": False,
                        "audits": [],
                        "treatyClaims": [],
                        "outstandingLiabilities": 0.0
                    }
                }
                residency_history.append(new_residency)
                update_data("individual.taxComplianceHistory.residencyHistory", residency_history)
                st.rerun()

    # -------------------- DISPLAY ITEMS PATTERN --------------------
    if residency_history:
        st.markdown("**📊 Registered Tax Residency Periods**")
        for i, residency in enumerate(residency_history):
            end_display = residency['dates'].get('end', 'Present') or 'Present'
            with st.expander(f"Residency {i+1}: {residency['country']} ({residency['dates']['start']} to {end_display})"):
                display_residency_details(residency, i, residency_history)
    else:
        st.info("ℹ️ No tax residency periods recorded yet. Use the form above to add your history.")

def display_residency_details(residency, index, residency_history):
    """Display and allow editing of residency compliance details"""
    # SPLIT CONTENT AND ACTIONS
    col1, col2 = st.columns([0.8, 0.2])
    with col1:
        st.write(f"**Tax Status:** {residency['taxStatus']}")
        st.write(f"**Tax ID:** {residency['taxIdentificationNumber'] or 'Not provided'}")
        st.write(f"**Primary Residence:** {'Yes' if residency['primaryTaxResidence'] else 'No'}")
    
    with col2:
        # CONSISTENT REMOVAL PATTERN
        if st.button("❌ Remove", key=f"remove_residency_{index}"):
            del residency_history[index]
            update_data("individual.taxComplianceHistory.residencyHistory", residency_history)
            st.rerun()

    # CONSISTENT FORM PATTERN FOR COMPLIANCE DETAILS
    with st.form(key=f"residency_details_{index}"):
        st.subheader("Compliance Details", anchor=False)
        col1, col2 = st.columns(2)
        with col1:
            returns_filed = st.checkbox(
                "Tax Returns Filed", 
                value=residency['compliance'].get('returnsFiled', False),
                help="Check if you filed all required tax returns for this period")
            
            audit_options = ["None", "Income Audit", "Wealth Audit", "Transfer Pricing", "VAT/GST Audit"]
            audit_history = st.multiselect(
                "Audit History",
                options=audit_options,
                default=residency['compliance'].get('audits', []),
                help="Select any tax audits you underwent during this period")
        
        with col2:
            treaty_options = ["None", "DTA Article 4 (Residency)", "DTA Article 15 (Employment)", "DTA Article 24 (Non-discrimination)"]
            treaty_claims = st.multiselect(
                "Tax Treaty Claims",
                options=treaty_options,
                default=residency['compliance'].get('treatyClaims', []),
                help="Select any tax treaty provisions you claimed")
            
            unpaid_liabilities = st.number_input(
                "Outstanding Liabilities",
                value=float(residency['compliance'].get('outstandingLiabilities', 0.0)),
                min_value=0.0,
                format="%.2f",
                help="Enter any unpaid tax amounts in local currency")

        submitted = st.form_submit_button("💾 Update Compliance")
        if submitted:
            residency['compliance'].update({
                "returnsFiled": returns_filed,
                "audits": audit_history,
                "treatyClaims": treaty_claims,
                "outstandingLiabilities": unpaid_liabilities
            })
            update_data("individual.taxComplianceHistory.residencyHistory", residency_history)
            st.success("✅ Compliance information updated successfully")

def disclosure_programs_section():
    """Handle voluntary disclosure program participation with data binding"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("🔍 Voluntary Disclosure Programs")
    st.caption("Record participation in tax amnesty or disclosure programs")
    
    # INFORMATION EXPANDER PATTERN
    with st.expander("📚 About Voluntary Disclosure Programs"):
        st.markdown("""
        **Voluntary disclosure programs allow taxpayers to:**
        
        - Declare previously unreported income or assets
        - Correct past non-compliance with reduced penalties
        - Regularize tax affairs before relocating internationally
        - Avoid potential criminal prosecution for tax evasion
        
        Many countries offer these programs to encourage compliance. Participation may need 
        to be disclosed when applying for residency in a new country.
        """)
    
    # DATA INITIALIZATION PATTERN
    disclosures = get_data("individual.taxComplianceHistory.disclosurePrograms") or {
        "streamlinedProcedures": False,
        "ovdiParticipation": False,
        "otherDisclosures": []
    }

    # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
    col1, col2 = st.columns(2)
    with col1:
        streamlined = st.checkbox(
            "Participated in Streamlined Disclosure Program",
            value=disclosures.get("streamlinedProcedures", False),
            help="US program for non-willful offshore compliance issues")
        
        ovdi = st.checkbox(
            "Participated in OVDP/OVDI",
            value=disclosures.get("ovdiParticipation", False),
            help="US Offshore Voluntary Disclosure Program/Initiative")
    
    with col2:
        other_program_options = [
            "DAC6 (EU Mandatory Disclosure)",
            "MDR (OECD Mandatory Disclosure Rules)",
            "CRS Self-Certification",
            "National Tax Amnesty Program",
            "Offshore Assets Voluntary Disclosure"
        ]
        
        other_programs = st.multiselect(
            "Other Disclosure Programs",
            options=other_program_options,
            default=disclosures.get("otherDisclosures", []),
            help="Select any other disclosure programs you've participated in")

    # UPDATE DATA BINDING
    update_data("individual.taxComplianceHistory.disclosurePrograms", {
        "streamlinedProcedures": streamlined,
        "ovdiParticipation": ovdi,
        "otherDisclosures": other_programs
    })
    
    # CONDITIONAL DISPLAY PATTERN
    if streamlined or ovdi or other_programs:
        st.success("✅ You have indicated participation in tax disclosure programs")
        
        # Additional details for participants
        with st.expander("📝 Disclosure Program Details"):
            disclosure_notes = st.text_area(
                "Additional information about your disclosure participation",
                value=get_data("individual.taxComplianceHistory.disclosureNotes") or "",
                help="Provide relevant dates, countries, and outcomes of your disclosure participation",
                placeholder="Example: Participated in Italian Tax Amnesty in 2019, disclosed offshore accounts in Switzerland"
            )
            update_data("individual.taxComplianceHistory.disclosureNotes", disclosure_notes)
    else:
        st.info("ℹ️ No disclosure program participation indicated")

def international_disclosures_section():
    """Handle international disclosure requirements with data binding"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("🌐 International Reporting Requirements")
    st.caption("Record compliance with international asset and account reporting")
    
    # INFORMATION EXPANDER PATTERN
    with st.expander("📚 About International Reporting Requirements"):
        st.markdown("""
        **Many countries require reporting of foreign assets and accounts:**
        
        - **FBAR (US)**: Report of Foreign Bank and Financial Accounts required for US persons with foreign accounts exceeding $10,000
        - **Form 8938 (US)**: Statement of Specified Foreign Financial Assets for US taxpayers with significant foreign assets
        - **CRS**: Common Reporting Standard for automatic exchange of financial account information between countries
        - **FATCA**: Foreign Account Tax Compliance Act requiring foreign financial institutions to report on US account holders
        
        Failure to comply with these requirements can result in significant penalties.
        """)
    
    # CONSISTENT SUBSECTION PATTERN
    st.markdown("**🏦 Foreign Account Reporting**")
    fbar_section()
    form8938_section()
    
    st.markdown("**💰 Foreign Entity Reporting**")
    foreign_entity_section()

def fbar_section():
    """Handle FBAR filing history with data binding"""
    # DATA INITIALIZATION PATTERN
    fbar = get_data("individual.taxComplianceHistory.internationalDisclosures.fbarFilings") or {
        "hasFiled": False,
        "yearsFiled": []
    }
    
    # CONSISTENT CHECKBOX PATTERN
    fbar_filed = st.checkbox(
        "Required to file FBAR (FinCEN Form 114)",
        value=fbar.get("hasFiled", False),
        help="Report of Foreign Bank and Financial Accounts - required for US persons with foreign accounts exceeding $10,000")
    
    # CONDITIONAL DISPLAY PATTERN
    if fbar_filed:
        # Available years (past 7 years plus current)
        current_year = datetime.now().year
        available_years = [str(year) for year in range(current_year-7, current_year+1)]
        
        fbar_years = st.multiselect(
            "Years FBAR Filed",
            options=available_years,
            default=fbar.get("yearsFiled", []),
            help="Select all years for which you filed an FBAR")
        
        # Additional compliance information
        col1, col2 = st.columns(2)
        with col1:
            fbar_late = st.checkbox(
                "Filed under late submission procedures",
                value=get_data("individual.taxComplianceHistory.internationalDisclosures.fbarLateSubmission") or False,
                help="Check if you used delinquent FBAR submission procedures")
        
        with col2:
            fbar_penalties = st.checkbox(
                "Paid penalties related to FBAR",
                value=get_data("individual.taxComplianceHistory.internationalDisclosures.fbarPenalties") or False,
                help="Check if you paid any penalties for late or non-filing of FBARs")
        
        # UPDATE DATA BINDING
        update_data("individual.taxComplianceHistory.internationalDisclosures.fbarLateSubmission", fbar_late)
        update_data("individual.taxComplianceHistory.internationalDisclosures.fbarPenalties", fbar_penalties)
    else:
        fbar_years = []
    
    # UPDATE DATA BINDING
    update_data("individual.taxComplianceHistory.internationalDisclosures.fbarFilings", {
        "hasFiled": fbar_filed,
        "yearsFiled": fbar_years
    })

def form8938_section():
    """Handle Form 8938 filing history with data binding"""
    # DATA INITIALIZATION PATTERN
    form8938 = get_data("individual.taxComplianceHistory.internationalDisclosures.form8938Filings") or {
        "hasFiled": False,
        "yearsFiled": []
    }
    
    # CONSISTENT CHECKBOX PATTERN
    form8938_filed = st.checkbox(
        "Required to file Form 8938 (FATCA)",
        value=form8938.get("hasFiled", False),
        help="Statement of Specified Foreign Financial Assets - required for US taxpayers with significant foreign assets")
    
    # CONDITIONAL DISPLAY PATTERN
    if form8938_filed:
        # Available years (past 7 years plus current)
        current_year = datetime.now().year
        available_years = [str(year) for year in range(current_year-7, current_year+1)]
        
        form8938_years = st.multiselect(
            "Years Form 8938 Filed",
            options=available_years,
            default=form8938.get("yearsFiled", []),
            help="Select all years for which you filed Form 8938")
        
        # Asset value information
        highest_value = st.number_input(
            "Highest aggregate value of foreign assets (USD)",
            min_value=0,
            value=int(get_data("individual.taxComplianceHistory.internationalDisclosures.highestAssetValue") or 50000),
            step=10000,
            help="Approximate highest aggregate value of reportable foreign assets")
        
        update_data("individual.taxComplianceHistory.internationalDisclosures.highestAssetValue", highest_value)
    else:
        form8938_years = []
    
    # UPDATE DATA BINDING
    update_data("individual.taxComplianceHistory.internationalDisclosures.form8938Filings", {
        "hasFiled": form8938_filed,
        "yearsFiled": form8938_years
    })

def foreign_entity_section():
    """Handle foreign entity reporting with data binding"""
    # DATA INITIALIZATION PATTERN
    foreign_entities = get_data("individual.taxComplianceHistory.internationalDisclosures.foreignEntities") or {
        "hasForeignEntities": False,
        "entityTypes": []
    }
    
    # CONSISTENT CHECKBOX PATTERN
    has_entities = st.checkbox(
        "Control or own foreign entities",
        value=foreign_entities.get("hasForeignEntities", False),
        help="Check if you control, own, or are a substantial shareholder in any foreign companies, trusts, or partnerships")
    
    # CONDITIONAL DISPLAY PATTERN
    if has_entities:
        entity_options = [
            "Foreign Corporation (Form 5471)",
            "Foreign Partnership (Form 8865)",
            "Foreign Trust (Form 3520/3520-A)",
            "Passive Foreign Investment Company (Form 8621)",
            "Foreign Disregarded Entity (Form 8858)",
            "Other Foreign Entity"
        ]
        
        entity_types = st.multiselect(
            "Types of Foreign Entities",
            options=entity_options,
            default=foreign_entities.get("entityTypes", []),
            help="Select all types of foreign entities you control or own")
        
        # Additional compliance information
        compliant = st.checkbox(
            "All required foreign entity forms filed",
            value=get_data("individual.taxComplianceHistory.internationalDisclosures.foreignEntityCompliance") or False,
            help="Check if you've filed all required forms for your foreign entities")
        
        update_data("individual.taxComplianceHistory.internationalDisclosures.foreignEntityCompliance", compliant)
    else:
        entity_types = []
    
    # UPDATE DATA BINDING
    update_data("individual.taxComplianceHistory.internationalDisclosures.foreignEntities", {
        "hasForeignEntities": has_entities,
        "entityTypes": entity_types
    })

def audit_history_section():
    """Handle tax audit history with data binding"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("🔎 Tax Audit History")
    st.caption("Record any tax audits or examinations you've experienced")
    
    # INFORMATION EXPANDER PATTERN
    with st.expander("📚 About Tax Audits"):
        st.markdown("""
        **Tax audits are formal examinations of your tax affairs by tax authorities:**
        
        - Audits verify the accuracy of your tax returns and compliance with tax laws
        - They can focus on specific issues or be comprehensive reviews
        - International taxpayers face higher audit rates (4.3% vs 0.8% for US domestic taxpayers)
        - Audit history may need to be disclosed when applying for residency in a new country
        - Most countries have a statute of limitations (typically 3-6 years) for conducting audits
        
        Maintaining good records is essential for successfully navigating a tax audit.
        """)
    
    # DATA INITIALIZATION PATTERN
    audits = get_data("individual.taxComplianceHistory.auditHistory") or []
    
    # -------------------- ADD NEW ITEM PATTERN --------------------
    with st.expander("➕ Add Audit Record"):
        with st.form(key="add_audit"):
            col1, col2 = st.columns(2)
            with col1:
                audit_year = st.number_input(
                    "Audit Year", 
                    min_value=2000, 
                    max_value=datetime.now().year,
                    value=datetime.now().year,
                    help="Year the audit was conducted")
                
                audit_country = st.selectbox(
                    "Audit Jurisdiction", 
                    options=[""] + get_country_list(),
                    index=0,
                    help="Country whose tax authority conducted the audit")
            
            with col2:
                audit_type = st.selectbox(
                    "Audit Type", 
                    ["Income Tax", "VAT/GST", "Wealth Tax", "Customs", "Payroll Tax", "Transfer Pricing", "International Reporting"],
                    help="Type of tax or issue that was audited")
                
                audit_result = st.selectbox(
                    "Result", 
                    ["No Change", "Additional Tax Due", "Refund Issued", "Penalties Imposed", "Still In Progress"],
                    help="Outcome of the audit")

            audit_notes = st.text_area(
                "Audit Details",
                placeholder="Provide relevant details about the audit scope, findings, or resolution",
                help="Additional information about the audit")

            submitted = st.form_submit_button("💾 Add Audit Record")
            if submitted and audit_country:
                audits.append({
                    "year": audit_year,
                    "jurisdiction": audit_country,
                    "type": audit_type,
                    "result": audit_result,
                    "notes": audit_notes
                })
                update_data("individual.taxComplianceHistory.auditHistory", audits)
                st.rerun()

    # -------------------- DISPLAY ITEMS PATTERN --------------------
    if audits:
        st.markdown("**📊 Registered Audit History**")
        for idx, audit in enumerate(audits):
            with st.expander(f"Audit {idx+1}: {audit['year']} - {audit['jurisdiction']} ({audit['type']})"):
                # SPLIT CONTENT AND ACTIONS - Define columns here, outside of any form
                display_col1, display_col2 = st.columns([0.8, 0.2])
                
                with display_col1:
                    st.write(f"**Type:** {audit.get('type', '')}")
                    st.write(f"**Result:** {audit.get('result', '')}")
                    if audit.get('notes'):
                        st.write(f"**Details:** {audit.get('notes', '')}")
                
                with display_col2:
                    # CONSISTENT REMOVAL PATTERN - Button outside of any form
                    if st.button("❌ Remove", key=f"remove_audit_{idx}"):
                        del audits[idx]
                        update_data("individual.taxComplianceHistory.auditHistory", audits)
                        st.rerun()

def filled_in_correctly(state):
    """Validate that all required fields are filled in correctly"""
    # VALIDATION PATTERN
    errors = []
    
    # Check residency history
    residency_history = state.get("residencyHistory", [])
    if not residency_history:
        errors.append("At least one tax residency period is required")
    
    for i, residency in enumerate(residency_history):
        if not residency.get("country"):
            errors.append(f"Residency {i+1}: Country is required")
        if not residency.get("dates", {}).get("start"):
            errors.append(f"Residency {i+1}: Start date is required")
        
    # Display validation results
    if errors:
        st.error("⚠️ Please fix the following errors:")
        for error in errors:
            st.warning(error)
        return False
    
    return True

