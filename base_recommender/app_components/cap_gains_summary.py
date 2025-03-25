# Capital Gains Summary Component - This would be added at the end of the Assets section
import streamlit as st
from app_components.helpers import get_data, update_data

def display_capital_gains_summary():
    """Calculate and display capital gains summary based on asset data."""
    st.subheader("Capital Gains Summary")
    st.write("This summary shows your potential capital gains tax exposure based on assets you plan to sell.")
    
    # Gather all assets intended for sale
    real_estate = get_data("individual.financialInformation.assets.realEstate", [])
    investments = get_data("individual.financialInformation.assets.investments", [])
    crypto = get_data("individual.financialInformation.assets.cryptocurrencyHoldings", [])
    
    # Calculate totals
    total_gains = 0
    before_move_gains = 0
    after_move_gains = 0
    long_term_gains = 0
    short_term_gains = 0
    
    # Default currency (use income currency if available)
    default_currency = get_data("individual.financialInformation.annualIncome.currency", "USD")
    
    # Process real estate gains
    for prop in real_estate:
        if prop.get("intendToSell", False) and "plannedSaleDetails" in prop:
            sale = prop["plannedSaleDetails"]
            gain = sale["expectedSalePrice"] - prop["acquisitionPrice"]
            if gain > 0:
                total_gains += gain
                if sale.get("sellBeforeMoving", False):
                    before_move_gains += gain
                else:
                    after_move_gains += gain
                    
                breakdown = sale.get("holdingPeriodBreakdown", {})
                long_term_gains += gain * breakdown.get("percentageLongTerm", 0) / 100
                short_term_gains += gain * breakdown.get("percentageShortTerm", 0) / 100
    
    # Similar calculations for investments and crypto
    # [Code omitted for brevity - follows same pattern as real estate]
    
    # Only display if there are gains to report
    if total_gains > 0:
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Total Expected Capital Gains", f"{default_currency} {total_gains:,.2f}")
            st.metric("Gains Realized Before Move", f"{default_currency} {before_move_gains:,.2f}")
            st.metric("Gains Realized After Move", f"{default_currency} {after_move_gains:,.2f}")
        
        with col2:
            before_pct = (before_move_gains / total_gains * 100) if total_gains > 0 else 0
            after_pct = (after_move_gains / total_gains * 100) if total_gains > 0 else 0
            
            st.metric("Long-Term Gains", f"{default_currency} {long_term_gains:,.2f}")
            st.metric("Short-Term Gains", f"{default_currency} {short_term_gains:,.2f}")
            
            # Visual breakdown
            st.write("**Timing of Capital Gains Realization:**")
            st.progress(before_pct / 100)
            st.caption(f"Before Move: {before_pct:.1f}% | After Move: {after_pct:.1f}%")
        
        # Store the summary data
        gains_summary = {
            "totalExpectedCapitalGains": total_gains,
            "currency": default_currency,
            "percentageRealizedBeforeMove": before_pct,
            "percentageRealizedAfterMove": after_pct,
            "holdingPeriodSummary": {
                "percentageLongTerm": (long_term_gains / total_gains * 100) if total_gains > 0 else 0,
                "percentageShortTerm": (short_term_gains / total_gains * 100) if total_gains > 0 else 0
            }
        }
        update_data("individual.financialInformation.capitalGainsSummary", gains_summary)
