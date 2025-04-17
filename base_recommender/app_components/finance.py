import streamlit as st
from app_components.helpers import (
    get_data, update_data, get_country_list, display_section)
import datetime

def finance(anchor):
    # ======================= SECTION HEADER =======================
    st.header(f"💵 {anchor}", anchor=anchor, divider="rainbow")

    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Your financial information helps:**
        - Assess tax obligations and reporting requirements
        - Determine eligibility for visas and residency based on financial means
        - Plan for cross-border asset management and compliance
        - Identify potential tax savings and risks
        - Prepare for financial planning in your destination country
        """)

    # ======================= FINANCE SUBSECTIONS =======================

    status = income_checker()
    st.divider()
    if status == "continuing_income":
        income_and_employment()
    elif status == "seeking_income":
        expected_employment_section()
    elif status == "current_and_new_income":
        income_and_employment()
        expected_employment_section()
    elif status == "gainfully unemployed":
        pass
    assets()
    st.divider()
    liabilities()
    st.divider()
    capital_gains()

    # ======================= SECTION SUMMARY =======================
    state = get_data("individual.finance")
    display_section("individual.finance", state)

def income_checker():
    INCOME_CASES = {
        "continuing_income": "I will continue all of my current income sources (work, investments, rental, etc.) after moving.",
        "current_and_new_income": "I will keep some or all of my current income sources, but will also have new ones arranged in my destination (job, business, rental, etc.).",
        "seeking_income": "I do not currently have any income sources, or will give them all up, and will need to find, or may already have found but not started, new sources in my destination.",
        "gainfully unemployed": "I will not have any income sources and will finance myself from savings, gifts, or other non-income means."
    }

    st.markdown("### What is your current employment situation?")
    selected_label = st.radio(
        "employment situation",
        list(INCOME_CASES.values()),
        label_visibility="hidden"
    )
    # Find the internal code/tag (case) for the selected label
    return [k for k, v in INCOME_CASES.items() if v == selected_label][0]
    
def income_and_employment():
    """
    Comprehensive Income Section with Categorization and Shortcut Option
    """
    st.subheader("💼 Income Sources")
    st.caption("Report all income sources for accurate tax and visa analysis")

    income_sources = get_data("individual.finance.incomeSources") or []

    # ======================= INCOME CATEGORIES =======================
    INCOME_CATEGORIES = {
        "Employment": {
            "fields": ["employer", "role", "country", "currency", "annual_income"],
            "help": "Traditional employment with regular salary"
        },
        "Self-Employment": {
            "fields": ["business_name", "business_type", "country", "currency", "net_profit"],
            "help": "Freelance, consulting, or business income"
        },
        "Investments": {
            "fields": ["investment_type", "issuer", "country", "currency", "annual_returns"],
            "help": "Dividends, interest, capital gains, royalties"
        },
        "Rental Income": {
            "fields": ["property_address", "property_type", "country", "currency", "annual_rent"],
            "help": "Residential or commercial property income"
        },
        "Pension/Retirement": {
            "fields": ["provider", "pension_type", "country", "currency", "annual_amount"],
            "help": "Government/Private pensions and retirement accounts"
        },
        "Other": {
            "fields": ["source_name", "source_type", "country", "currency", "annual_amount"],
            "help": "Alimony, grants, prizes, and miscellaneous sources"
        }
    }

    # ======================= ADD INCOME SOURCE =======================
    with st.expander("➕ Add Income Source", expanded=False):
        with st.form("add_income_source"):
            # Category Selection
            category = st.selectbox(
                "Income Category",
                options=list(INCOME_CATEGORIES.keys()),
                help="Select the most appropriate category for this income"
            )
            
            # Dynamic Fields Based on Selected Category
            cols = st.columns([2, 2])
            fields = {}
            for field in INCOME_CATEGORIES[category]["fields"]:
                if field == "employer":
                    fields[field] = cols[0].text_input("Employer Name")
                elif field == "role":
                    fields[field] = cols[1].text_input("Your Role/Position")
                elif field == "business_name":
                    fields[field] = cols[0].text_input("Business Name")
                elif field == "net_profit":
                    fields[field] = cols[1].number_input("Net Profit", min_value=0, format="%d")
                elif field == "investment_type":
                    fields[field] = cols[0].selectbox("Investment Type", ["Stocks", "Bonds", "REITs", "Crypto", "Other"])
                elif field == "annual_returns":
                    fields[field] = cols[1].number_input("Annual Returns", min_value=0, format="%d")
                elif field == "property_address":
                    fields[field] = cols[0].text_input("Property Address")
                elif field == "annual_rent":
                    fields[field] = cols[1].number_input("Annual Rent", min_value=0, format="%d")
                elif field == "provider":
                    fields[field] = cols[0].text_input("Pension Provider")
                elif field == "annual_amount":
                    fields[field] = cols[1].number_input("Annual Amount", min_value=0, format="%d")
                elif field == "source_name":
                    fields[field] = cols[0].text_input("Source Name")
                elif field == "source_type":
                    fields[field] = cols[1].text_input("Source Type")

            # Common Fields (applied regardless of category)
            cols = st.columns([1.5, 1, 1])
            with cols[0]:
                country = st.selectbox("Country", [""] + get_country_list())
            with cols[1]:
                currency = st.selectbox("Currency", sorted(st.session_state.currencies))
            with cols[2]:
                amount = st.number_input("Annual Amount", min_value=0, format="%d")

            # Continuation Status
            continue_in_destination = st.checkbox(
                "✅ Will continue this income after relocation",
                help="Check if you'll maintain this income source once you move"
            )

            if st.form_submit_button("💾 Save Income Source"):
                income_sources.append({
                    "category": category,
                    **fields,
                    "country": country,
                    "currency": currency,
                    "annual_amount": amount,
                    "continue_in_destination": continue_in_destination
                })
                update_data("individual.finance.incomeSources", income_sources)
                st.rerun()

    # ======================= INCOME SHORTCUT =======================
    with st.expander("⚡ Quick Total Income Entry", expanded=False):
        st.warning("""
        ⚠️ **Using this shortcut may:**
        - Limit tax optimization opportunities
        - Miss country-specific reporting requirements
        - Reduce accuracy of visa financial eligibility calculations
        """)
        with st.form("total_income_shortcut"):
            total_income = st.number_input("Total Annual Income", min_value=0, format="%d")
            currency = st.selectbox("Currency", sorted(st.session_state.currencies))
            if st.form_submit_button("💾 Save Total Income"):
                income_sources.append({
                    "category": "Shortcut Entry",
                    "currency": currency,
                    "annual_amount": total_income,
                    "notes": "Quick total income entry - detailed breakdown not available"
                })
                update_data("individual.finance.incomeSources", income_sources)
                st.rerun()

    # ======================= INCOME SUMMARY =======================
    st.markdown("---")
    st.subheader("📊 Income Summary")
    
    if income_sources:
        # Calculate totals
        total_income_val = sum(item["annual_amount"] for item in income_sources)
        main_currency = income_sources[0]["currency"] if income_sources else "USD"
        
        # Display summary metrics
        cols = st.columns([3, 3])
        cols[0].metric("Total Annual Income", f"{main_currency} {total_income_val:,}")
        
        # Breakdown by category with progress indicators
        category_totals = {}
        for item in income_sources:
            cat = item["category"]
            category_totals[cat] = category_totals.get(cat, 0) + item["annual_amount"]
        
        cols[1].write("**Breakdown by Category:**")
        for cat, amt in category_totals.items():
            cols[1].progress(amt / total_income_val, text=f"{cat}: {main_currency} {amt:,}")

        # Detailed list of each income source
        st.markdown("### 📋 Income Sources Detail")
        for idx, source in enumerate(income_sources):
            display_name = source.get("employer", source.get("business_name", source["category"]))
            with st.expander(f"{display_name} - {source['currency']} {source['annual_amount']:,}", expanded=False):
                cols = st.columns([2, 1, 1, 1])
                cols[0].write(f"**Category:** {source['category']}")
                cols[1].write(f"**Country:** {source.get('country', 'N/A')}")
                cols[2].write(f"**Currency:** {source['currency']}")
                cols[3].write(f"**Continues Post-Move:** {'✅' if source.get('continue_in_destination', False) else '❌'}")
                
                for key, value in source.items():
                    if key not in ["category", "country", "currency", "annual_amount", "continue_in_destination"]:
                        st.write(f"**{key.title()}:** {value}")
                
                if st.button("❌ Remove", key=f"remove_income_{idx}"):
                    income_sources.pop(idx)
                    update_data("individual.finance.incomeSources", income_sources)
                    st.rerun()
    else:
        st.info("🌟 No income sources added yet. Use the forms above to get started.")

    st.markdown("---")
    st.caption("💡 Report all income sources for accurate tax and visa planning. Include even small or irregular income streams.")

def expected_employment_section():
    st.subheader("🌍 Expected Employment/Income in Destination Country")
    st.caption("Add each job offer or expected employment you may have in your destination country. "
               "Indicate if it is a real offer (for visa purposes) or an estimate (for planning/tax).")

    expected_employment = get_data("individual.finance.expectedEmployment") or []

    with st.expander("➕ Add Expected Employment/Income", expanded=False):
        with st.form("add_expected_employment"):
            cols = st.columns([2, 2])
            with cols[0]:
                country = st.selectbox(
                    "Country",
                    options=[""] + get_country_list(),
                    help="Country where you expect to work or have an offer"
                )
            with cols[1]:
                is_real_offer = st.radio(
                    "Is this a real job offer?",
                    options=["Yes", "No"],
                    help="Select 'Yes' if you have a formal offer (for visa), 'No' if this is an estimate or job search plan",
                    horizontal=True
                ) == "Yes"

            employer = st.text_input(
                "Employer/Organization (optional for estimates)",
                help="Leave blank if you are just estimating or searching"
            )
            role = st.text_input(
                "Role/Position",
                help="What is the job title or type of work?"
            )
            salary = st.number_input(
                "Annual Salary (gross)",
                min_value=0,
                help="Expected or offered annual salary"
            )
            currency = st.selectbox(
                "Currency",
                options=sorted(st.session_state.currencies),
                index=sorted(st.session_state.currencies).index("USD")
            )
            hours_per_week = st.slider(
                "Expected hours per week",
                min_value=10,
                max_value=60,
                value=40
            )
            notes = st.text_area(
                "Notes (optional)",
                help="E.g. Offer valid until..., or 'Estimate based on market research'"
            )

            submitted = st.form_submit_button("💾 Add")
            if submitted and country and role and salary > 0:
                expected_employment.append({
                    "country": country,
                    "employer": employer,
                    "role": role,
                    "salary": salary,
                    "currency": currency,
                    "hours_per_week": hours_per_week,
                    "is_real_offer": is_real_offer,
                    "notes": notes
                })
                update_data("individual.finance.expectedEmployment", expected_employment)
                st.rerun()

    # Display all expected employments
    if expected_employment:
        st.markdown("**📋 Your Expected Employment/Income Entries**")
        for idx, job in enumerate(expected_employment):
            with st.expander(f"{job['role']} in {job['country']} ({'Offer' if job['is_real_offer'] else 'Estimate'})"):
                st.write(f"**Employer:** {job['employer'] or 'N/A'}")
                st.write(f"**Role:** {job['role']}")
                st.write(f"**Country:** {job['country']}")
                st.write(f"**Salary:** {job['currency']} {job['salary']:,.2f}")
                st.write(f"**Hours/week:** {job['hours_per_week']}")
                st.write(f"**Type:** {'Real Offer' if job['is_real_offer'] else 'Estimate/Plan'}")
                if job.get("notes"):
                    st.write(f"**Notes:** {job['notes']}")
                if st.button("❌ Remove", key=f"remove_expected_{idx}"):
                    expected_employment.pop(idx)
                    update_data("individual.finance.expectedEmployment", expected_employment)
                    st.rerun()
    else:
        st.info("No expected employment or job offers added yet.")

    st.caption("💡 This section is important for both tax and visa analysis. "
               "If you have multiple offers or plans, add each separately.")

def assets():
    st.subheader("📊 Asset Portfolio")
    st.caption("Track all assets with detailed financial and tax-relevant information")

    assets = get_data("individual.finance.assets.portfolio") or []

    st.markdown("#### ➕ Add Assets or Holdings")
    entry_mode = st.radio(
        "Choose entry method:",
        [
            "Single Asset Entry",
            "Bulk Add by Group",
            "Total Wealth Shortcut"
        ],
        horizontal=True
    )

    if entry_mode == "Single Asset Entry":
        with st.form("single_asset_form"):
            cols = st.columns([2, 1, 1])
            with cols[0]:
                name = st.text_input("Asset Name", help="E.g. 'Apple Inc. Shares'")
            with cols[1]:
                type_ = st.selectbox("Type", ["Stock", "Cash (Equivalent)", "Bond", "ETF", "Real Estate", 
                                              "Crypto", "Commodity", "Other"])
            with cols[2]:
                country = st.selectbox("Country", ["Global"] + get_country_list())

            cols = st.columns([1, 1, 1, 1])
            with cols[0]:
                currency = st.selectbox("Currency", sorted(st.session_state.currencies))
            with cols[1]:
                acquired = st.date_input("Acquisition Date", datetime.date.today())
            with cols[2]:
                cost_basis = st.number_input("Cost Basis", min_value=0.0, format="%.2f")
            with cols[3]:
                current_value = st.number_input("Current Value", min_value=0.0, format="%.2f")

            notes = st.text_area("Additional Notes", help="Brokerage account, certificate numbers, etc.")

            if st.form_submit_button("💾 Add Asset"):
                assets.append({
                    "name": name,
                    "type": type_,
                    "country": country,
                    "currency": currency,
                    "acquired": acquired.isoformat(),
                    "cost_basis": cost_basis,
                    "current_value": current_value,
                    "notes": notes
                })
                update_data("individual.finance.assets.portfolio", assets)
                st.rerun()

    elif entry_mode == "Add by Group":
        st.markdown("**Bulk Add by Group**")
        st.caption(
            "Add entire asset groups at once. Select a group below to quickly add a representative asset for that category."
        )

        group_definitions = [
            {
                "label": "Stock Portfolio",
                "default": {
                    "name": "Stock Portfolio",
                    "type": "Stock",
                    "country": "Global",
                    "currency": "USD",
                    "acquired": datetime.date.today().isoformat(),
                    "cost_basis": 0.0,
                    "current_value": 0.0,
                    "notes": "All stocks held"
                }
            },
            {
                "label": "Crypto Total",
                "default": {
                    "name": "Crypto Total",
                    "type": "Crypto",
                    "country": "Global",
                    "currency": "USD",
                    "acquired": datetime.date.today().isoformat(),
                    "cost_basis": 0.0,
                    "current_value": 0.0,
                    "notes": "All cryptocurrencies held"
                }
            },
            {
                "label": "Real Estate Holdings",
                "default": {
                    "name": "Real Estate Holdings",
                    "type": "Real Estate",
                    "country": "Global",
                    "currency": "USD",
                    "acquired": datetime.date.today().isoformat(),
                    "cost_basis": 0.0,
                    "current_value": 0.0,
                    "notes": "All real estate properties"
                }
            },
            {
                "label": "Add Other Holdings",
                "default": {
                    "name": "Add Other Holdings",
                    "type": "Other",
                    "country": "Global",
                    "currency": "USD",
                    "acquired": datetime.date.today().isoformat(),
                    "cost_basis": 0.0,
                    "current_value": 0.0,
                    "notes": "All real estate properties"
                }
            },
        ]

        group_labels = [g["label"] for g in group_definitions]
        group_choice = st.selectbox("Select a group to add:", group_labels)
        group = next(g for g in group_definitions if g["label"] == group_choice)
        with st.form(f"group_form_{group['label']}"):
            st.write(f"Add details for **{group['label']}**")
            currency = st.selectbox("Currency", sorted(st.session_state.currencies), key=f"currency_{group['label']}")
            acquired = st.date_input("Acquisition Date", datetime.date.today(), key=f"acquired_{group['label']}")
            cost_basis = st.number_input("Cost Basis", min_value=0.0, format="%.2f", key=f"cost_{group['label']}")
            current_value = st.number_input("Current Value", min_value=0.0, format="%.2f", key=f"value_{group['label']}")
            notes = st.text_area("Additional Notes", value=group['default']['notes'], key=f"notes_{group['label']}")

            if st.form_submit_button("💾 Add Group Asset"):
                asset = group['default'].copy()
                asset['currency'] = currency
                asset['acquired'] = acquired.isoformat()
                asset['cost_basis'] = cost_basis
                asset['current_value'] = current_value
                asset['notes'] = notes
                assets.append(asset)
                update_data("individual.finance.assets.portfolio", assets)
                st.success(f"Added {group['label']}.")
                st.rerun()

    elif entry_mode == "Total Wealth Shortcut":
        st.caption(
            "If you want to skip detailed entry, you can enter your total wealth directly below. "
            "⚠️ *Note: This limits your ability to analyze asset allocation, tax optimization, and track gains/losses.*"
        )
        with st.form("total_wealth_shortcut_form", clear_on_submit=True):
            shortcut_currency = st.selectbox("Currency", sorted(st.session_state.currencies), key="shortcut_currency")
            shortcut_wealth = st.number_input("Total Wealth", min_value=0.0, format="%.2f", key="shortcut_wealth")
            shortcut_notes = st.text_input("Notes (optional, e.g. 'Estimate as of 2025-04-16')", key="shortcut_notes")
            if st.form_submit_button("➕ Add as Total Wealth"):
                # COMMENT: Using the shortcut means you lose the ability to break down results by asset class, country, or type.
                # You also can't track unrealized gains/losses or optimize for taxes, since all detail is lost.
                assets.append({
                    "name": "Total Wealth (Shortcut)",
                    "type": "Total",
                    "country": "Global",
                    "currency": shortcut_currency,
                    "acquired": datetime.date.today().isoformat(),
                    "cost_basis": shortcut_wealth,
                    "current_value": shortcut_wealth,
                    "notes": shortcut_notes + " [Shortcut entry]"
                })
                update_data("individual.finance.assets.portfolio", assets)
                st.success("Total wealth shortcut added.")
                st.rerun()

    # ======================= ASSET DISPLAY & MANAGEMENT =======================
    if assets:
        st.markdown("### 🗂️ Your Assets")
        for idx, asset in enumerate(assets):
            with st.expander(f"{asset['name']} ({asset['type']})", expanded=False):
                cols = st.columns([3, 1, 1, 1, 0.5])
                cols[0].write(f"**Country:** {asset['country']}")
                cols[0].write(f"**Acquired:** {asset.get('acquired', 'N/A')}")
                cols[0].write(f"**Notes:** {asset.get('notes', '')}")
                cols[1].metric("Cost Basis", f"{asset['currency']} {asset['cost_basis']:,.2f}")
                cols[2].metric("Current Value", f"{asset['currency']} {asset['current_value']:,.2f}")
                gain_loss = asset['current_value'] - asset['cost_basis']
                gain_color = "green" if gain_loss >= 0 else "red"
                cols[3].markdown(f"**Unrealized Gain/Loss**<br><span style='color:{gain_color}'>{asset['currency']} {gain_loss:+,.2f}</span>", unsafe_allow_html=True)
                if cols[4].button("❌", key=f"remove_asset_{idx}"):
                    assets.pop(idx)
                    update_data("individual.finance.assets.portfolio", assets)
                    st.rerun()

        # ======================= TOTAL HOLDINGS & WEALTH =======================
        st.markdown("---")
        total_current_value = sum(a['current_value'] for a in assets)
        from collections import Counter
        currency_counts = Counter([a['currency'] for a in assets])
        display_currency = currency_counts.most_common(1)[0][0] if currency_counts else "USD"
        st.markdown(f"## 💰 **Total Wealth:** {display_currency} {total_current_value:,.2f}")
        st.info("This is considered your **Total Wealth** based on the current value of all assets entered above, including cash.")

        # ======================= TAX CONSIDERATIONS =======================
        st.markdown("---")
        with st.expander("🧾 Tax Preparation Assistant"):
            st.info("💡 This section helps organize assets for potential tax scenarios:")
            cols = st.columns(3)
            with cols[0]:
                st.metric("Total Cost Basis", f"{display_currency} {sum(a['cost_basis'] for a in assets):,.2f}")
            with cols[1]:
                st.metric("Total Current Value", f"{display_currency} {total_current_value:,.2f}")
            with cols[2]:
                st.metric("Total Unrealized Gains", f"{display_currency} {sum(a['current_value'] - a['cost_basis'] for a in assets):+,.2f}")
            st.caption("ℹ️ Dividend-bearing assets should be reported in the Income section")
    else:
        st.info("🌟 No assets added yet. Use the form above to start building your portfolio")

    st.markdown("---")
    st.info("💡 **Dividend Reporting Note:** Assets generating dividends should be reported in the *Income Sources* section. This section tracks capital assets for capital gains/loss calculations.")

def liabilities():
    st.subheader("💳 Liabilities & Debts")
    st.caption(
        "List all your outstanding debts, obligations, and other liabilities. "
        "This includes mortgages, loans, credit cards, tax debts, foreign liabilities, and any other financial obligations. "
        "Complete and accurate reporting is important for tax, visa, and financial compliance in all jurisdictions."
    )

    liabilities = get_data("individual.finance.liabilities") or []

    with st.expander("➕ Add Liability or Debt", expanded=False):
        with st.form("add_liability"):
            cols = st.columns([2, 1, 1])
            with cols[0]:
                liability_type = st.selectbox(
                    "Type of Liability",
                    options=[
                        "Mortgage", "Car loan", "Student loan", "Credit card debt",
                        "Business loan", "Personal loan", "Tax liability", "Foreign tax debt",
                        "Unpaid bills (utilities, rent, etc.)", "Legal/judgment debt",
                        "Child/spousal support", "Payroll/employee obligations",
                        "Deferred tax", "Other"
                    ],
                    help="Select the category that best describes this liability"
                )
            with cols[1]:
                jurisdiction = st.selectbox(
                    "Jurisdiction/Country",
                    options=[""] + get_country_list(),
                    help="Country or region where the liability is owed"
                )
            with cols[2]:
                currency = st.selectbox(
                    "Currency",
                    options=sorted(st.session_state.currencies),
                    help="Currency in which this liability is denominated"
                )

            cols2 = st.columns([1, 1, 1, 1])
            with cols2[0]:
                amount = st.number_input("Outstanding Amount", min_value=0.0, format="%.2f")
            with cols2[1]:
                monthly_payment = st.number_input("Monthly Payment", min_value=0.0, format="%.2f")
            with cols2[2]:
                interest_rate = st.number_input("Interest Rate (%)", min_value=0.0, format="%.2f", help="Annual interest rate (if applicable)")
            with cols2[3]:
                maturity_date = st.date_input("Maturity/Payoff Date", value=None, help="Date by which the liability must be paid off (if applicable)")

            cols3 = st.columns([1, 1, 2])
            with cols3[0]:
                is_current = st.radio(
                    "Is this a current (due within 1 year) or long-term liability?",
                    options=["Current (≤1 year)", "Long-term (>1 year)"],
                    horizontal=True
                )
            with cols3[1]:
                collateral = st.text_input("Collateral/Security", help="Describe any collateral or security for this liability (if any)")
            with cols3[2]:
                responsible_parties = st.text_input("Who is responsible?", help="List all responsible parties (e.g. you, spouse, business)")

            notes = st.text_area("Additional Notes", help="E.g. payment arrangements, legal status, dispute, etc.")

            submitted = st.form_submit_button("💾 Add Liability")
            if submitted:
                liabilities.append({
                    "type": liability_type,
                    "jurisdiction": jurisdiction,
                    "currency": currency,
                    "amount": amount,
                    "monthlyPayment": monthly_payment,
                    "interestRate": interest_rate,
                    "maturityDate": maturity_date.isoformat() if maturity_date else "",
                    "isCurrent": is_current,
                    "collateral": collateral,
                    "responsibleParties": responsible_parties,
                    "notes": notes
                })
                update_data("individual.finance.liabilities", liabilities)
                st.rerun()

    # --- Display all liabilities ---
    if liabilities:
        st.markdown("### 🗂️ Your Liabilities & Debts")
        total_liab = sum(l['amount'] for l in liabilities)
        total_monthly = sum(l['monthlyPayment'] for l in liabilities)
        main_currency = liabilities[0]['currency'] if liabilities else "USD"
        st.metric("Total Outstanding Liabilities", f"{main_currency} {total_liab:,.2f}")
        st.metric("Total Monthly Payments", f"{main_currency} {total_monthly:,.2f}")

        for idx, l in enumerate(liabilities):
            with st.expander(f"{l['type']} in {l['jurisdiction'] or 'N/A'} ({l['currency']} {l['amount']:,.2f})", expanded=False):
                cols = st.columns([2, 1, 1, 1, 1])
                cols[0].write(f"**Type:** {l['type']}")
                cols[0].write(f"**Jurisdiction:** {l['jurisdiction'] or 'N/A'}")
                cols[0].write(f"**Responsible:** {l.get('responsibleParties', 'You')}")
                cols[1].write(f"**Outstanding:** {l['currency']} {l['amount']:,.2f}")
                cols[1].write(f"**Monthly Payment:** {l['currency']} {l['monthlyPayment']:,.2f}")
                cols[2].write(f"**Interest Rate:** {l['interestRate']:.2f}%")
                cols[2].write(f"**Maturity Date:** {l['maturityDate'] or 'N/A'}")
                cols[3].write(f"**Current/Long-term:** {l['isCurrent']}")
                cols[3].write(f"**Collateral:** {l['collateral'] or 'None'}")
                if l.get("notes"):
                    cols[4].write(f"**Notes:** {l['notes']}")
                if cols[4].button("❌ Remove", key=f"remove_liability_{idx}"):
                    liabilities.pop(idx)
                    update_data("individual.finance.liabilities", liabilities)
                    st.rerun()
        st.caption("💡 All liabilities, including foreign and tax-related debts, are relevant for visa and tax compliance. "
                   "For complex or disputed liabilities, add details in the notes.")
    else:
        st.info("🌟 No liabilities added yet. Use the form above to add your debts and obligations.")

    st.markdown("---")
    st.caption("**Why report liabilities?**\n"
               "- Immigration and tax authorities in many countries require disclosure of all debts and obligations, "
               "including foreign, tax, legal, and personal liabilities. This affects your net worth, ability to pay, "
               "and financial eligibility for visas and residency. Accurate reporting also helps with tax deductions, "
               "interest expense claims, and compliance with local and international laws.")


def capital_gains():
    st.subheader("📈 Capital Gains & Major Asset Sales")
    st.caption("Report recent asset sales and planned disposals around your move")

    # --- Expanded Guidance Section ---
    with st.expander("💡 Capital Gains 101 - What You Need to Know", expanded=True):
        st.markdown("""
        **What are Capital Gains?**  
        You make a capital gain when you sell an asset for more than you paid for it. This applies to:
        - Real estate (except primary home in some countries)
        - Stocks/investments
        - Cryptocurrency/NFTs
        - Businesses or business assets
        - Valuable collectibles (art, jewelry, etc.)

        **Why Recent Sales Matter for Moves:**  
        Many countries apply special rules to assets sold:
        - **1 year before moving**: May still tax gains if connected to old country
        - **After moving**: New country may tax worldwide gains from arrival date
        - **Exit taxes**: Some countries tax unrealized gains when you leave

        **How to Calculate:**  
        ```
        Gain = Sale Price - (Purchase Price + Improvement Costs)
        ```
        Example:  
        Bought apartment for $300k → Spent $50k renovating → Sold for $500k  
        **Taxable Gain = $500k - ($300k + $50k) = $150k**
        """)
        st.warning("⚠️ **Common Tax Traps**  \
        - Selling assets right before moving may still trigger taxes in both countries \
        - Gifting assets before moving can sometimes count as a 'sale' \
        - Crypto-to-crypto trades often count as taxable events")

    # --- Recent Sales Before Move ---
    st.markdown("### 🕒 Recent Asset Sales (Last 12 Months)")
    recent_gains = get_data("individual.finance.capitalGains.recent") or []

    has_recent = st.checkbox(
        "Did you sell any major assets in the past 12 months?",
        value=bool(recent_gains),
        help="Include property, investments, crypto, or business assets"
    )
    
    if has_recent:
        with st.form("add_recent_gain"):
            cols = st.columns([2,1,1,1])
            with cols[0]:
                asset = st.selectbox(
                    "Asset Type",
                    options=["Real Estate", "Stocks/ETFs", "Crypto", "Business", "Other"],
                    index=0
                )
            with cols[1]:
                purchase_price = st.number_input("Purchase Price", min_value=0)
            with cols[2]:
                sale_price = st.number_input("Sale Price", min_value=0)
            with cols[3]:
                sale_date = st.date_input("Sale Date", datetime.date.today())
            
            country = st.selectbox(
                "Country Where Asset Was Located/Sold",
                options=[""] + get_country_list(),
                help="Important for determining tax jurisdiction"
            )
            
            if st.form_submit_button("➕ Add Sale"):
                recent_gains.append({
                    "asset": asset,
                    "purchase_price": purchase_price,
                    "sale_price": sale_price,
                    "sale_date": sale_date.isoformat(),
                    "country": country,
                    "gain": sale_price - purchase_price
                })
                update_data("individual.finance.capitalGains.recent", recent_gains)
                st.rerun()

        if recent_gains:
            st.markdown("**📋 Recent Sales Reported**")
            for idx, gain in enumerate(recent_gains):
                cols = st.columns([2,1,1,1,1,0.5])
                cols[0].write(f"**{gain['asset']}** in {gain['country']}")
                cols[1].metric("Bought", f"${gain['purchase_price']:,}")
                cols[2].metric("Sold", f"${gain['sale_price']:,}")
                cols[3].metric("Gain", f"${gain['gain']:,}", 
                             delta_color="off" if gain['gain'] <0 else "normal")
                cols[4].write(f"Sold: {datetime.date.fromisoformat(gain['sale_date']):%b %Y}")
                if cols[5].button("❌", key=f"remove_recent_{idx}"):
                    recent_gains.pop(idx)
                    update_data("individual.finance.capitalGains.recent", recent_gains)
                    st.rerun()

    # --- Planned Sales Around Move ---
    st.markdown("### 🔮 Planned Sales Around Move")
    planned_sales = get_data("individual.finance.capitalGains.planned") or []

    with st.expander("➕ Add Planned Sale Before/After Moving"):
        with st.form("add_planned_sale"):
            cols = st.columns([2,1,1])
            with cols[0]:
                asset = st.text_input("Asset Description", 
                                    help="E.g. 'London apartment' or 'Apple stock'")
            with cols[1]:
                est_value = st.number_input("Estimated Value", min_value=0)
            with cols[2]:
                timing = st.selectbox(
                    "When Selling",
                    options=["1-3 months before move", 
                            "During move month",
                            "1-3 months after move"]
                )
            
            purpose = st.radio(
                "Primary Reason for Sale",
                options=["Funding relocation costs", 
                        "Avoiding exit taxes",
                        "Simplifying portfolio",
                        "Market conditions"],
                horizontal=True
            )
            
            if st.form_submit_button("💾 Add Planned Sale"):
                planned_sales.append({
                    "asset": asset,
                    "est_value": est_value,
                    "timing": timing,
                    "purpose": purpose
                })
                update_data("individual.finance.capitalGains.planned", planned_sales)
                st.rerun()
    
    if planned_sales:
        st.markdown("**📋 Planned Disposals**")
        for idx, sale in enumerate(planned_sales):
            cols = st.columns([3,1,1,1,0.5])
            cols[0].write(f"**{sale['asset']}**")
            cols[1].metric("Value", f"${sale['est_value']:,}")
            cols[2].write(f"Timing: {sale['timing']}")
            cols[3].write(f"Reason: {sale['purpose']}")
            if cols[4].button("❌", key=f"remove_planned_{idx}"):
                planned_sales.pop(idx)
                update_data("individual.finance.capitalGains.planned", planned_sales)
                st.rerun()

    # --- Tax Optimization Warning ---
    st.markdown("---")
    with st.container(border=True):
        st.warning("""
        **Before You Sell Anything:**  
        Consider these tax optimization strategies:
        - Check holding periods for long-term vs short-term rates
        - Use capital losses to offset gains
        - Review double taxation treaties
        - Explore primary residence exemptions
        """)
        st.button("📆 Book Tax Consultation", type="secondary")

