"""
Perplexity AI Prompt Templates - Enhanced Immigration & Tax Advisory
Version: 2025-09-10
Last Updated: September 10, 2025

CHANGE LOG:
- 2025-09-10: Enhanced version with resource guidance, improved structure, cost focus
- Future changes: Add notes here about prompt modifications and why they were made

PURPOSE:
This file contains optimized prompt templates for comprehensive immigration and tax advisory.
Focus on actionable, specific, and well-researched responses with proper citations.

USAGE:
- Edit the templates below to improve AI responses
- Add version notes when making changes
- Test changes using the Results component in the frontend
- Keep prompts focused on deliverable outcomes
"""

from datetime import datetime
from typing import Any


def get_system_prompt() -> str:
    """
    Enhanced system prompt emphasizing expertise, current information, and structured responses.

    EDITING NOTES:
    - Emphasizes current date awareness for regulatory changes
    - Focuses on specific, quantifiable advice
    - Requires proper citation of sources
    """
    return """You are an expert immigration lawyer and tax advisor with comprehensive knowledge of international immigration law, tax compliance, and cross-border relocation strategies.

Your expertise includes:
- Current immigration laws and recent regulatory changes (2025)
- International tax treaties, compliance requirements, and optimization strategies
- Visa pathways, processing times, and approval probabilities by country
- Family immigration procedures and dependent considerations
- Residency and citizenship timeline requirements
- Cross-border tax implications and double taxation treaties

RESPONSE REQUIREMENTS:
- Provide specific costs, timelines, and processing requirements
- Calculate exact tax obligations with sample scenarios
- Research current government websites and official sources
- Include form numbers, official procedures, and regulatory references
- Address both immediate (Year 1) and long-term (Years 2-5) implications
- Structure responses with clear headers and actionable recommendations
- Cite all sources properly and reference recent regulatory changes

Current Date Context: {current_date} - Ensure all advice reflects current regulations."""


def get_research_guidance() -> str:
    """
    Specific guidance on where to research for accurate, current information.

    EDITING NOTES:
    - Directs AI to authoritative sources
    - Emphasizes recent regulatory changes
    - Provides specific website types to prioritize
    """
    return """RESEARCH PRIORITY SOURCES:

GOVERNMENT & OFFICIAL SOURCES (Highest Priority):
- Official immigration department websites (.gov, .gouv, etc.)
- Tax authority websites and publications
- Embassy and consulate official pages
- Official gazette publications and legal updates
- Government-published immigration guides and forms

LEGAL & PROFESSIONAL SOURCES (High Priority):
- Immigration law firm websites and updates
- International tax advisory publications
- Professional legal associations
- Big 4 accounting firm tax guides (PWC, KPMG, Deloitte, EY)
- Bar association immigration resources

SPECIFIC FOCUS AREAS:
- 2025 regulatory changes and recent law modifications
- Double taxation treaty texts and recent amendments
- Current visa processing times and success rates
- Updated fee schedules and financial requirements
- Recent court decisions affecting immigration/tax law

COST & TIMELINE SPECIFICITY:
- Government fee schedules (with official amounts)
- Professional service cost ranges
- Document preparation timeframes
- Processing time estimates by visa type
- Timeline for each step in the immigration process"""


def get_enhanced_analysis_instruction() -> str:
    """
    Comprehensive analysis instruction with specific deliverable requirements.

    EDITING NOTES:
    - More specific about required calculations
    - Emphasizes year-by-year planning
    - Requests specific cost breakdowns
    """
    return """Analyze the following individual's profile and provide comprehensive VISA and TAX guidance for their relocation plans.

REQUIRED DELIVERABLES:

1. SPECIFIC TAX CALCULATIONS:
   - Calculate exact tax liability for Years 1-3 with multiple income scenarios
   - Include all applicable taxes (income, wealth, exit, social security)
   - Show effective tax rates and after-tax income
   - Compare tax burden vs. current country obligations
   - Account for double taxation treaty benefits or lack thereof

2. VISA PATHWAY ANALYSIS:
   - Rank visa options by probability of success (High/Medium/Low)
   - Provide specific cost breakdown for each pathway
   - Include processing times and renewal requirements
   - Address family member visa requirements separately
   - Identify alternative strategies if primary options fail

3. YEAR-BY-YEAR IMPLEMENTATION PLAN:
   - Month-by-month action plan for Year 1
   - Key milestones and deadlines for Years 2-3
   - Specific document requirements and timing
   - Professional service engagement recommendations
   - Cost timeline and budget planning

4. RISK MITIGATION STRATEGIES:
   - Common application rejection reasons and how to avoid them
   - Regulatory change risks and contingency planning
   - Tax compliance pitfalls and prevention measures
   - Family separation risks and mitigation strategies"""


def get_comprehensive_focused_questions() -> list[str]:
    """
    Enhanced question set covering all critical aspects with specific detail requirements.

    EDITING NOTES:
    - More specific about quantifiable requirements
    - Covers edge cases and family considerations
    - Emphasizes recent regulatory changes
    """
    return [
        "1. What are the TOP 3 visa pathways for this profile, ranked by success probability? Include specific costs, processing times, and approval rates for each option.",
        "2. Calculate EXACT tax obligations for the first 3 years, showing scenarios for $50k, $100k, and $150k annual income. Include income tax, wealth tax, social security, and any exit taxes from current country.",
        "3. What RECENT REGULATORY CHANGES (2024-2025) affect this profile? Include new requirements, processing changes, or policy updates that impact the strategy.",
        "4. Create a MONTH-BY-MONTH timeline for the first year, including document preparation, application submissions, and key deadlines with specific dates.",
        "5. What are the SPECIFIC REQUIREMENTS for family members (spouse/children)? Include separate application processes, dependency documentation, and timeline considerations.",
        "6. Which DOUBLE TAXATION TREATIES apply between current and destination countries? Calculate the exact tax savings or additional obligations under treaty provisions.",
        "7. What are the MINIMUM FINANCIAL REQUIREMENTS for each visa pathway? Include bank statements, income proof, investment amounts, and maintenance funds with specific amounts.",
        "8. List ALL REQUIRED DOCUMENTS with official form numbers, apostille requirements, translation needs, and validity periods for each document type.",
        "9. What PROFESSIONAL SERVICES are essential vs. optional? Include immigration lawyers, tax advisors, and service providers with estimated cost ranges.",
        "10. Identify TOP 5 FAILURE POINTS in applications for this profile and provide specific strategies to avoid each risk factor.",
    ]


def get_cost_analysis_framework() -> str:
    """
    Specific framework for cost analysis and financial planning.

    EDITING NOTES:
    - Provides structure for comprehensive cost breakdown
    - Ensures all cost categories are covered
    - Includes ongoing vs. one-time costs
    """
    return """COST ANALYSIS REQUIREMENTS:

VISA APPLICATION COSTS:
- Government fees (by visa type)
- Document preparation and apostille costs
- Translation and certification fees
- Medical examination requirements
- Professional service fees (lawyers, consultants)

ONGOING COMPLIANCE COSTS:
- Annual tax preparation and advisory fees
- Visa renewal costs and timelines
- Residence permit maintenance requirements
- Healthcare insurance obligations
- Language test fees (if required)

FIRST YEAR SETTLEMENT COSTS:
- Initial accommodation and deposits
- Transportation and logistics
- Bank account setup and financial services
- Insurance requirements and costs
- Children's education costs and requirements

HIDDEN OR UNEXPECTED COSTS:
- Currency exchange implications
- Emergency travel requirements
- Document re-certification needs
- Appeals or re-application fees
- Compliance penalty risks"""


def get_family_considerations_framework() -> str:
    """
    Specific framework for addressing family member requirements.

    EDITING NOTES:
    - Ensures comprehensive family planning
    - Addresses timing and dependency issues
    - Covers education and healthcare transitions
    """
    return """FAMILY MEMBER CONSIDERATIONS:

SPOUSE/PARTNER REQUIREMENTS:
- Dependency vs. independent application options
- Work authorization implications
- Tax filing requirements (joint vs. separate)
- Residence requirement compliance for both parties

CHILDREN/DEPENDENT CONSIDERATIONS:
- Age-based visa requirements and limitations
- Education system transition and requirements
- Healthcare coverage and vaccination requirements
- Custody documentation for international moves
- Timeline coordination for school year planning

TIMING STRATEGIES:
- Simultaneous vs. staggered application benefits
- Family reunification pathway optimization
- School calendar coordination
- Tax year timing considerations
- Residence requirement management for all family members"""


def build_enhanced_prompt(
    profile_story: str, destination_country: str, include_raw_data: bool = True, raw_data: str = ""
) -> str:
    """
    Enhanced prompt builder with comprehensive guidance and country-specific focus.

    Args:
        profile_story: The generated story from the user's profile data
        destination_country: Target country for immigration
        include_raw_data: Whether to include raw profile dump for reference
        raw_data: Raw JSON data formatted as markdown (if including)

    Returns:
        Complete enhanced prompt ready to send to Perplexity AI
    """
    current_date = datetime.utcnow().strftime("%Y-%m-%d")

    # Build the complete enhanced prompt
    prompt_parts = [
        get_system_prompt().format(current_date=current_date),
        "",
        get_research_guidance(),
        "",
        get_enhanced_analysis_instruction(),
        "",
        f"TARGET DESTINATION: {destination_country.upper()}",
        "",
        "INDIVIDUAL PROFILE:",
        profile_story,
        "",
        get_cost_analysis_framework(),
        "",
        get_family_considerations_framework(),
        "",
        "SPECIFIC ANALYSIS QUESTIONS:",
        "",
        "\n".join(get_comprehensive_focused_questions()),
        "",
        "RESPONSE FORMAT REQUIREMENTS:",
        "- Use clear headers and subheaders for organization",
        "- Include specific costs in local currency and USD",
        "- Provide timeline tables with specific dates",
        "- Create actionable checklists for each phase",
        "- Include proper citations for all sources",
        "- Highlight recent regulatory changes prominently",
    ]

    main_prompt = "\n".join(prompt_parts)

    if include_raw_data and raw_data:
        appendix = f"\n\n---\nRAW PROFILE DATA (for reference):\n{raw_data}"
        return main_prompt + appendix

    return main_prompt


def get_enhanced_perplexity_config() -> dict[str, Any]:
    """
    Optimized Perplexity API configuration for comprehensive research.

    EDITING NOTES:
    - Uses deep research model for thoroughness
    - Low temperature for factual accuracy
    - Balanced top_p for comprehensive coverage
    """
    return {
        "model": "sonar-deep-research",  # Best model for comprehensive analysis
        "temperature": 0.1,  # Low temperature for factual, precise responses
        "top_p": 0.9,  # High top_p for comprehensive coverage
    }


def get_country_specific_resources() -> dict[str, list[str]]:
    """
    Country-specific resources to guide research focus.

    EDITING NOTES:
    - Add new countries as needed
    - Update with current official websites
    - Include recent regulatory change sources
    """
    return {
        "argentina": [
            "Argentina National Immigration Directorate (DNM)",
            "AFIP tax authority website",
            "Argentine embassy websites",
            "Buenos Aires immigration lawyers",
            "Recent Decree 366/2025 changes",
        ],
        "portugal": [
            "SEF immigration authority",
            "Portal das Finanças tax authority",
            "Golden Visa program updates",
            "D7 visa requirements",
            "Recent EU citizenship changes",
        ],
        "spain": [
            "Spanish immigration office websites",
            "Agencia Tributaria tax authority",
            "Non-lucrative visa requirements",
            "Golden Visa program changes",
            "Recent tax residency updates",
        ],
        "general": [
            "OECD tax treaty database",
            "Embassy official websites",
            "Professional immigration lawyers",
            "Big 4 tax advisory publications",
            "Recent EU regulatory changes",
        ],
    }


# ENHANCED TESTING FUNCTIONS
def test_enhanced_prompt_with_sample_data():
    """
    Test function to preview enhanced prompt with sample data.
    """
    sample_story = """Personal Information:
The individual was born on 10 September 1995 (age 30). Nationality/ies held: Croatia. Currently, the individual is a citizen in Croatia. They are relocating with their unmarried partner and child (age 10).

Residency Plans:
The individual plans a permanent move to Argentina, specifically interested in the Buenos Aires region. They maintain significant ties to their current country and are interested in eventual citizenship.

Finance:
User has not provided specific income information but maintains property in the Netherlands."""

    sample_raw = """```json
{
  "personalInformation": {
    "dateOfBirth": "1995-09-10",
    "nationalities": [{"country": "Croatia", "willingToRenounce": false}]
  },
  "familyInformation": {
    "partner": {"dateOfBirth": "1995-09-10", "nationality": "Croatia"},
    "children": [{"age": 10, "nationality": "Croatia"}]
  }
}
```"""

    full_prompt = build_enhanced_prompt(sample_story, "Argentina", True, sample_raw)
    print("=== ENHANCED PROMPT PREVIEW ===")
    print(full_prompt[:2000] + "..." if len(full_prompt) > 2000 else full_prompt)
    print("=== END PREVIEW ===")
    return full_prompt


def get_prompt_validation_checklist() -> list[str]:
    """
    Checklist to validate prompt quality before deployment.
    """
    return [
        "✓ Includes current date context for regulatory awareness",
        "✓ Specifies exact cost calculation requirements",
        "✓ Provides comprehensive resource guidance",
        "✓ Covers family member considerations separately",
        "✓ Requests specific timeline with dates",
        "✓ Includes risk mitigation strategies",
        "✓ Emphasizes recent regulatory changes",
        "✓ Requires proper source citations",
        "✓ Specifies response format requirements",
        "✓ Covers both immediate and long-term planning",
    ]


if __name__ == "__main__":
    # Run enhanced test when file is executed directly
    test_enhanced_prompt_with_sample_data()
    print("\n=== VALIDATION CHECKLIST ===")
    for item in get_prompt_validation_checklist():
        print(item)
