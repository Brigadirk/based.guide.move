import streamlit as st
from app_components.helpers import update_data, get_data, get_country_list
from datetime import datetime
import json

def filled_in_correctly(tax_compliance_history_state):
    pass

def residency_history_section():
    st.subheader("Residency History")
    residency_history = get_data("individual.taxComplianceHistory.residencyHistory")

    with st.form("add_residency"):
        col1, col2 = st.columns(2)
        with col1:
            country = st.selectbox("Country", options=get_country_list(), key="residency_country")
            start_date = st.date_input("Residency Start Date")
            tax_status = st.selectbox("Tax Status", ["Resident", "Non-Resident", "Domiciled"])
        with col2:
            end_date = st.date_input("Residency End Date")
            tax_number = st.text_input("Local Tax ID Number")
            primary_tax = st.checkbox("Was primary tax residence?")

        if st.form_submit_button("Add Residency Period"):
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

    for i, residency in enumerate(residency_history):
        with st.expander(f"{residency['country']} ({residency['dates']['start']} to {residency['dates']['end'] or 'Present'})"):
            display_residency_details(residency, i, residency_history)

def display_residency_details(residency, index, residency_history):
    st.write(f"**Tax Status:** {residency['taxStatus']}")
    st.write(f"**Tax ID:** {residency['taxIdentificationNumber']}")
    st.write(f"**Primary Residence:** {'Yes' if residency['primaryTaxResidence'] else 'No'}")

    with st.form(key=f"residency_details_{index}"):
        col1, col2 = st.columns(2)
        with col1:
            returns_filed = st.checkbox("Tax Returns Filed", value=residency['compliance']['returnsFiled'])
            audit_history = st.multiselect("Audit History",
                                           ["None", "Income Audit", "Wealth Audit", "Transfer Pricing"],
                                           default=residency['compliance']['audits'])
        with col2:
            treaty_claims = st.multiselect("Tax Treaty Claims",
                                           ["DTA Article 4", "DTA Article 15", "DTA Article 24"],
                                           default=residency['compliance']['treatyClaims'])
            unpaid_liabilities = st.number_input("Outstanding Liabilities",
                                                 value=residency['compliance'].get('outstandingLiabilities', 0.0),
                                                 min_value=0.0)

        if st.form_submit_button("Update Compliance"):
            residency['compliance'].update({
                "returnsFiled": returns_filed,
                "audits": audit_history,
                "treatyClaims": treaty_claims,
                "outstandingLiabilities": unpaid_liabilities
            })
            update_data("individual.taxComplianceHistory.residencyHistory", residency_history)

def disclosure_programs_section():
    st.subheader("International Disclosures")
    disclosures = get_data("individual.taxComplianceHistory.disclosurePrograms")

    col1, col2 = st.columns(2)
    with col1:
        streamlined = st.checkbox("Participated in Streamlined Disclosure Program",
                                  value=disclosures.get("streamlinedProcedures", False))
        ovdi = st.checkbox("Participated in OVDP/OVDI",
                           value=disclosures.get("ovdiParticipation", False))
    with col2:
        other_programs = st.multiselect("Other Disclosure Programs",
                                        ["DAC6", "MDR", "CRS Self-Certification"],
                                        default=disclosures.get("otherDisclosures", []))

    update_data("individual.taxComplianceHistory.disclosurePrograms", {
        "streamlinedProcedures": streamlined,
        "ovdiParticipation": ovdi,
        "otherDisclosures": other_programs
    })

def international_disclosures_section():
    fbar_section()
    form8938_section()

def fbar_section():
    fbar = get_data("individual.taxComplianceHistory.internationalDisclosures.fbarFilings")
    
    fbar_filed = st.checkbox("Required to file FBAR",
                             value=fbar.get("hasFiled", False))
    if fbar_filed:
        fbar_years = st.multiselect("Years FBAR Filed",
                                    [str(year) for year in range(2015, 2026)],
                                    default=fbar.get("yearsFiled", []))
    
    update_data("individual.taxComplianceHistory.internationalDisclosures.fbarFilings", {
        "hasFiled": fbar_filed,
        "yearsFiled": fbar_years if fbar_filed else []
    })

def form8938_section():
    form8938 = get_data("individual.taxComplianceHistory.internationalDisclosures.form8938Filings")
    
    form8938_filed = st.checkbox("Required to file Form 8938",
                                 value=form8938.get("hasFiled", False))
    if form8938_filed:
        form8938_years = st.multiselect("Years Form 8938 Filed",
                                        [str(year) for year in range(2015, 2026)],
                                        default=form8938.get("yearsFiled", []))
    
    update_data("individual.taxComplianceHistory.internationalDisclosures.form8938Filings", {
        "hasFiled": form8938_filed,
        "yearsFiled": form8938_years if form8938_filed else []
    })

def audit_history_section():
    audits = get_data("individual.taxComplianceHistory.auditHistory")

    with st.form(key="add_audit"):
        col1, col2 = st.columns(2)
        with col1:
            audit_year = st.number_input("Audit Year", min_value=2000, max_value=2025)
            audit_country = st.selectbox("Audit Jurisdiction", options=get_country_list())
        with col2:
            audit_type = st.selectbox("Audit Type", ["Income Tax", "VAT/GST", "Wealth Tax", "Customs"])
            audit_result = st.selectbox("Result", ["No Change", "Additional Tax Due", "Refund Issued"])

        if st.form_submit_button("Add Audit Record"):
            audits.append({
                "year": audit_year,
                "jurisdiction": audit_country,
                "type": audit_type,
                "result": audit_result
            })
            update_data("individual.taxComplianceHistory.auditHistory", audits)

    for audit in audits:
        with st.expander(f"{audit['year']} - {audit['jurisdiction']} ({audit['type']})"):
            for key, value in audit.items():
                if key != 'year' and key != 'jurisdiction':
                    st.write(f"**{key.capitalize()}:** {value}")

def tax_compliance_history():
    st.header("Tax Compliance History", anchor="Tax Compliance History")    
    if not st.toggle("Show section", value=True, key="show_tax_compliance_history"):
        st.info("Section is hidden. Toggle to show. Your previously entered data is preserved.")
    else:
        residency_history_section()
        disclosure_programs_section()
        international_disclosures_section()
        audit_history_section()

        tax_compliance_history_state = get_data("individual.taxComplianceHistory")
        if st.button("Show current Taxs Compliance History state"):
            st.json(json.dumps(tax_compliance_history_state, indent=2))
                
        st.divider()
        return filled_in_correctly(tax_compliance_history_state)