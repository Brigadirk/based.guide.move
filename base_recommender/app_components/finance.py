import streamlit as st
from app_components.helpers import (
    get_data,
    update_data,
    get_country_list,
    display_section,
)
import datetime

def finance(anchor):
    # ======================= SECTION HEADER =======================
    st.header(f"💵 {anchor}", anchor=anchor, divider="rainbow")

    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- QUICK OPTION TO SKIP DETAILS --------------------
    skip_all = st.checkbox(
        "🚀 I do not care about taxation or finance-related matters—just tell me whether there are any financial requirements and instructions for me to move.",
        key="skip_finance_details",
    )

    # Persist the choice so other sections can read it
    st.session_state["skip_tax_sections"] = skip_all

    if skip_all:
        st.success(
            "✅ Detailed finance inputs skipped. We'll focus only on whether any financial "
            "thresholds apply to your relocation."
        )
        display_section("individual.finance", "Finance (Summary Only)")
        return
    else:
        # If the user unticks the box on a later visit, re-enable all sections
        st.session_state.pop("skip_tax_sections", None)

    # -------------------- ENSURE REQUIRED STATE KEYS EXIST --------------------
    finance_state = st.session_state.data["individual"]["finance"]

    # Lists that we append to
    for k in ["incomeSources", "expectedEmployment", "liabilities"]:
        finance_state.setdefault(k, [])

    # Dicts for new features
    finance_state.setdefault("totalWealth", {})

    # Capital-gains subtree
    cg = finance_state.setdefault("capitalGains", {"hasGains": False, "details": []})
    cg.setdefault("futureSales", [])

    # ======================= FINANCE SUBSECTIONS =======================

    # ----- 1. INCOME SOURCES ------------------------------------------
    status = income_checker()
    st.divider()
    if status == "continuing_income":
        income_and_employment()
    elif status == "seeking_income":
        expected_employment_section()
    elif status == "current_and_new_income":
        income_and_employment()
        expected_employment_section()
    elif status == "gainfully_unemployed":
        pass  # no forms needed

    # ----- 2. WEALTH & CAPITAL GAINS ----------------------------------
    st.divider()
    total_wealth_section()
    st.divider()
    capital_gains()

    # ----- 3. LIABILITIES (always shown last) -------------------------
    st.divider()
    liabilities()

    # ======================= SECTION SUMMARY =======================
    display_section("individual.finance", "Finance")

def total_wealth_section():
    """Simple form for entering overall net worth and primary-residence share."""
    st.subheader("💰 Total Wealth")
    st.caption(
        "Enter **everything you own**, then indicate how much of that is tied up in your primary residence "
        "(often taxed differently or exempt)."
    )

    data = get_data("individual.finance.totalWealth") or {}
    default_currency = data.get("currency", "USD")

    with st.form("total_wealth_form"):
        currency = st.selectbox(
            "Currency",
            sorted(st.session_state.currencies),
            index=sorted(st.session_state.currencies).index(default_currency)
            if default_currency in st.session_state.currencies else 0,
        )
        total = st.number_input(
            "Total net worth",
            min_value=0.0,
            value=float(data.get("total", 0.0)),
            format="%.2f",
        )
        primary = st.number_input(
            "…of which is your primary residence",
            min_value=0.0,
            value=float(data.get("primary_residence", 0.0)),
            format="%.2f",
        )
        if st.form_submit_button("💾 Save"):
            update_data(
                "individual.finance.totalWealth",
                {"currency": currency, "total": total, "primary_residence": primary},
            )
            st.success("Total wealth information saved.")
            st.rerun()

    if data:
        cols = st.columns(2)
        cols[0].metric("Total wealth", f"{data.get('currency','USD')} {data.get('total',0):,.2f}")
        cols[1].metric(
            "Primary residence",
            f"{data.get('currency','USD')} {data.get('primary_residence',0):,.2f}",
        )

def capital_gains():
    # Focus is the first 12 months after arriving, so users can estimate their
    # *first-year* tax bill in the destination country.
    st.subheader("📈 Planned Asset Sales in Your First Year (Capital Gains)")
    # Inline tooltip-style explainer
    st.caption(
        "ℹ️ **What are capital gains?**  "
        "Generally:  *Sale price – (Purchase price + improvements + fees)*.  "
        "If that number is positive you have a gain; if negative it's a loss."
    )

    sales = get_data("individual.finance.capitalGains.futureSales") or []

    with st.form("add_cap_gain", clear_on_submit=True):
        asset = st.text_input("1️⃣ Asset name / description")
        a_type = st.selectbox(
            "2️⃣ Asset type",
            ["Real Estate", "Stocks/ETFs", "Crypto", "Business", "Collectibles", "Other"],
        )
        holding = st.selectbox(
            "3️⃣ Holding period",
            [
                "< 12 months (short-term)",
                "12 – 24 months",
                "2 – 3 years",
                "3 – 5 years",
                "5 – 10 years",
                "> 10 years",
            ],
        )
        surplus = st.number_input(
            "4️⃣ Estimated surplus value (profit)",
            min_value=0.0,
            format="%.2f",
        )
        # Default currency picker → USD
        currency_list = sorted(st.session_state.currencies)
        usd_idx = currency_list.index("USD") if "USD" in currency_list else 0
        currency = st.selectbox("Currency", currency_list, index=usd_idx)
        reason = st.text_area("5️⃣ Reason for sale (optional)")

        if st.form_submit_button("➕ Add planned sale") and asset:
            sales.append(
                {
                    "asset": asset,
                    "type": a_type,
                    "holding_time": holding,
                    "surplus_value": surplus,
                    "currency": currency,
                    "reason": reason,
                }
            )
            update_data("individual.finance.capitalGains.futureSales", sales)
            st.rerun()

    if sales:
        st.markdown("**📋 Your Planned Asset Sales**")
        for i, s in enumerate(sales):
            with st.container(border=True):
                col1, col2, col3, col4, col5 = st.columns([2.5, 1.2, 1.5, 1.8, 0.8])
                
                with col1:
                    st.markdown(f"**{s['asset']}**")
                    st.caption(f"Type: {s['type']}")
                
                with col2:
                    st.markdown(f"**Holding Period**")
                    st.write(s['holding_time'])
                
                with col3:
                    st.markdown(f"**Expected Profit**")
                    st.metric(
                        "", 
                        f"{s['currency']} {s['surplus_value']:,.0f}",
                        label_visibility="collapsed"
                    )
                
                with col4:
                    st.markdown(f"**Reason**")
                    st.write(s['reason'] or "—")
                
                with col5:
                    st.markdown("&nbsp;")  # Spacer
                    if st.button("🗑️", key=f"remove_sale_{i}", help="Remove this planned sale"):
                        sales.pop(i)
                        update_data("individual.finance.capitalGains.futureSales", sales)
                        st.rerun()

def income_checker():
    """
    Improved income source selection interface with clear visual hierarchy,
    simplified labels, and progressive disclosure.
    """
    INCOME_OPTIONS = {
        "continuing_income": {
            "label": "🔄 Continue Current Income",
            "description": "Keep all existing income sources (remote work, investments, rental, etc.)",
            "category": "active",
        },
        "current_and_new_income": {
            "label": "🔄➕ Current + New Income Mix",
            "description": "Keep some current sources, add new ones in destination",
            "category": "active",
        },
        "seeking_income": {
            "label": "🔍 Need New Income Sources",
            "description": "Will find new work, start business, or other new sources",
            "category": "active",
        },
        "gainfully_unemployed": {
            "label": "💰 Self-Funded (No Income)",
            "description": "Living off savings, gifts, or investments",
            "category": "passive",
        },
        "dependent/supported": {
            "label": "🤝 Financially Supported",
            "description": "Family, partner, scholarship, or institutional support",
            "category": "passive",
        },
    }

    st.markdown("### What's your income situation after moving?")
    display_options = [v["label"] for v in INCOME_OPTIONS.values()]
    option_keys = list(INCOME_OPTIONS.keys())
    idx = st.radio(
        "Select your situation:",
        range(len(display_options)),
        format_func=lambda x: display_options[x],
        label_visibility="collapsed",
    )
    st.info(f"**Selected:** {INCOME_OPTIONS[option_keys[idx]]['description']}")
    return option_keys[idx]

def income_and_employment():
    """
    Comprehensive Income Section with Categorization and Dynamic Fields
    """
    st.subheader("💼 Income Sources")
    st.info(
        "**🎯 Important: Report INCOME ONLY, not asset values**\n\n"
        "This section is for reporting *income you actually receive* from all sources."
    )

    income_sources = get_data("individual.finance.incomeSources") or []

    INCOME_CATEGORIES = {
        "Employment": {
            "fields": ["employer", "role"],
            "help": "Traditional employment with regular salary or wages",
        },
        "Self-Employment": {
            "fields": ["business_name", "business_type"],
            "help": "Freelance, consulting, or business income",
        },
        "Investments": {
            "fields": ["investment_type", "issuer"],
            "help": "Dividends, interest, capital gains distributions",
        },
        "Rental Income": {
            "fields": ["property_description", "property_type"],
            "help": "Income from residential or commercial property rentals",
        },
        "Other": {
            "fields": ["source_name", "source_type"],
            "help": "Alimony, grants, prizes, royalties, etc.",
        },
    }

    with st.expander("➕ Add Income Source"):
        category = st.selectbox(
            "Income Category",
            options=list(INCOME_CATEGORIES.keys()),
            help="Select the most appropriate category",
            key="income_category_selector",
        )
        st.markdown(f"*{INCOME_CATEGORIES[category]['help']}*")

        with st.form("add_income_source"):
            cols = st.columns([2, 2])
            fields = {}
            for field in INCOME_CATEGORIES[category]["fields"]:
                if field == "employer":
                    fields[field] = cols[0].text_input("Employer Name")
                elif field == "role":
                    fields[field] = cols[1].text_input("Role/Position")
                elif field == "business_name":
                    fields[field] = cols[0].text_input("Business Name")
                elif field == "business_type":
                    fields[field] = cols[1].text_input("Business Type")
                elif field == "investment_type":
                    fields[field] = cols[0].selectbox(
                        "Investment Type",
                        ["Stocks/Dividends", "Bonds/Interest", "REITs", "ETFs", "Crypto", "Other"],
                    )
                elif field == "issuer":
                    fields[field] = cols[1].text_input("Issuer/Fund Name")
                elif field == "property_description":
                    fields[field] = cols[0].text_input("Property Description")
                elif field == "property_type":
                    fields[field] = cols[1].selectbox("Property Type", ["Residential", "Commercial", "Mixed"])
                elif field == "source_name":
                    fields[field] = cols[0].text_input("Source Name/Description")
                elif field == "source_type":
                    fields[field] = cols[1].text_input("Source Type")

            cols = st.columns([1, 1])
            country = cols[0].selectbox("Country (source of funds)", [""] + get_country_list())
            st.markdown("---")
            cols = st.columns([1, 1])
            amount = cols[0].number_input("Annual Amount", min_value=0.0, format="%.2f")
            currency_list = sorted(st.session_state.currencies)
            usd_idx = currency_list.index("USD") if "USD" in currency_list else 0
            currency = cols[1].selectbox("Currency", currency_list, index=usd_idx)

            timing = st.radio(
                "When does / will this income arise?",
                [
                    "This is a current source of income that I will continue",
                    "This is a hypothetical income source that I expect to have after moving and want to know taxation of",
                ],
                index=0,
            )
            continue_in_destination = timing.startswith("This is a current")

            if st.form_submit_button("💾 Save Income Source"):
                income_sources.append(
                    {
                        "category": category,
                        "fields": fields,
                        "country": country,
                        "amount": amount,
                        "currency": currency,
                        "continue_in_destination": continue_in_destination,
                    }
                )
                update_data("individual.finance.incomeSources", income_sources)
                st.success("Income source added.")
                st.rerun()

    if income_sources:
        st.markdown("**📋 Your Income Sources**")
        for i, source in enumerate(income_sources):
            with st.container(border=True):
                col1, col2, col3, col4, col5 = st.columns([2.5, 1.2, 1.5, 1.8, 0.8])
                
                with col1:
                    st.markdown(f"**{source['category']}**")
                    # Show relevant field details
                    if source['fields']:
                        field_details = []
                        for key, value in source['fields'].items():
                            if value:  # Only show non-empty fields
                                field_details.append(f"{key.replace('_', ' ').title()}: {value}")
                        if field_details:
                            st.caption(" • ".join(field_details))
                
                with col2:
                    st.markdown(f"**Country**")
                    st.write(source['country'] or "—")
                
                with col3:
                    st.markdown(f"**Annual Amount**")
                    st.metric(
                        "", 
                        f"{source['currency']} {source['amount']:,.0f}",
                        label_visibility="collapsed"
                    )
                
                with col4:
                    st.markdown(f"**Status**")
                    status_text = "Current" if source.get("continue_in_destination", True) else "Future"
                    st.write(status_text)
                
                with col5:
                    st.markdown("&nbsp;")  # Spacer
                    if st.button("🗑️", key=f"remove_source_{i}", help="Remove this income source"):
                        income_sources.pop(i)
                        update_data("individual.finance.incomeSources", income_sources)
                        st.rerun()

def liabilities():
    """
    Liabilities Section with Dynamic Fields
    """
    st.subheader("📝 Liabilities & Debts")
    st.info(
        "**🎯 Important: Report DEBTS ONLY, not asset values**\n\n"
        "This section is for reporting *debts you actually owe* from all sources."
    )

    liabilities = get_data("individual.finance.liabilities") or []

    LIABILITY_CATEGORIES = {
        "Mortgage": {
            "fields": ["property_description", "property_type"],
            "help": "Debt secured by a property",
        },
        "Loan": {
            "fields": ["lender", "purpose"],
            "help": "Unsecured loan or personal loan",
        },
        "Credit Card": {
            "fields": ["card_issuer"],
            "help": "Credit card debt",
        },
        "Other": {
            "fields": ["description", "type"],
            "help": "Alimony, child support, student loans, etc.",
        },
    }

    with st.expander("➕ Add Liability"):
        category = st.selectbox(
            "Liability Category",
            options=list(LIABILITY_CATEGORIES.keys()),
            help="Select the most appropriate category",
            key="liability_category_selector",
        )
        st.markdown(f"*{LIABILITY_CATEGORIES[category]['help']}*")

        with st.form("add_liability"):
            cols = st.columns([2, 2])
            fields = {}
            for field in LIABILITY_CATEGORIES[category]["fields"]:
                if field == "property_description":
                    fields[field] = cols[0].text_input("Property Description")
                elif field == "property_type":
                    fields[field] = cols[1].selectbox("Property Type", ["Residential", "Commercial", "Mixed"])
                elif field == "lender":
                    fields[field] = cols[0].text_input("Lender Name")
                elif field == "purpose":
                    fields[field] = cols[1].text_input("Purpose of Loan")
                elif field == "card_issuer":
                    fields[field] = cols[0].text_input("Card Issuer")
                elif field == "description":
                    fields[field] = cols[0].text_input("Description")
                elif field == "type":
                    fields[field] = cols[1].text_input("Type")

            cols = st.columns([1, 1])
            country = cols[0].selectbox("Country", [""] + get_country_list())
            st.markdown("---")
            cols = st.columns([1, 1])
            amount = cols[0].number_input("Amount", min_value=0.0, format="%.2f")
            currency_list = sorted(st.session_state.currencies)
            usd_idx = currency_list.index("USD") if "USD" in currency_list else 0
            currency = cols[1].selectbox("Currency", currency_list, index=usd_idx)

            # Add payback timeline and interest rate fields
            st.markdown("---")
            cols = st.columns([1, 1])
            with cols[0]:
                payback_years = st.number_input(
                    "Payback timeline (years)",
                    min_value=0.0,
                    max_value=50.0,
                    value=0.0,
                    step=0.5,
                    help="How many years until this debt is fully paid off"
                )
            with cols[1]:
                interest_rate = st.number_input(
                    "Interest rate (%)",
                    min_value=0.0,
                    max_value=100.0,
                    value=0.0,
                    step=0.1,
                    help="Annual interest rate on this debt"
                )

            if st.form_submit_button("💾 Save Liability"):
                liabilities.append(
                    {
                        "category": category,
                        "fields": fields,
                        "country": country,
                        "amount": amount,
                        "currency": currency,
                        "payback_years": payback_years,
                        "interest_rate": interest_rate,
                    }
                )
                update_data("individual.finance.liabilities", liabilities)
                st.success("Liability added.")
                st.rerun()

    if liabilities:
        st.markdown("**📋 Your Liabilities**")
        for i, liability in enumerate(liabilities):
            with st.container(border=True):
                col1, col2, col3, col4, col5, col6 = st.columns([2.2, 1.0, 1.2, 1.0, 1.0, 0.8])
                
                with col1:
                    st.markdown(f"**{liability['category']}**")
                    # Show relevant field details
                    if liability['fields']:
                        field_details = []
                        for key, value in liability['fields'].items():
                            if value:  # Only show non-empty fields
                                field_details.append(f"{key.replace('_', ' ').title()}: {value}")
                        if field_details:
                            st.caption(" • ".join(field_details))
                
                with col2:
                    st.markdown(f"**Country**")
                    st.write(liability['country'] or "—")
                
                with col3:
                    st.markdown(f"**Amount**")
                    st.metric(
                        "", 
                        f"{liability['currency']} {liability['amount']:,.0f}",
                        label_visibility="collapsed"
                    )
                
                with col4:
                    st.markdown(f"**Payback**")
                    payback_years = liability.get('payback_years', 0)
                    if payback_years > 0:
                        st.write(f"{payback_years:.1f} years")
                    else:
                        st.write("—")
                
                with col5:
                    st.markdown(f"**Interest**")
                    interest_rate = liability.get('interest_rate', 0)
                    if interest_rate > 0:
                        st.write(f"{interest_rate:.1f}%")
                    else:
                        st.write("—")
                
                with col6:
                    st.markdown("&nbsp;")  # Spacer
                    if st.button("🗑️", key=f"remove_liability_{i}", help="Remove this liability"):
                        liabilities.pop(i)
                        update_data("individual.finance.liabilities", liabilities)
                        st.rerun()
