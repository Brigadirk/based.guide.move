import os
import re
import markdown
from bs4 import BeautifulSoup

def extract_core_tax_description_markdown(markdown_content, country_name):
    """
    Aggressively extracts core tax description content from Markdown, removing extensive website furniture.

    This version has a vastly expanded list of boilerplate patterns to remove almost all website
    navigation, lists, contact blocks, and other non-tax content.

    Args:
        markdown_content (str): The Markdown content of a country's tax summary.
        country_name (str): The name of the country (for potential context).

    Returns:
        str: Cleaned Markdown content focused on tax descriptions.
    """

    cleaned_lines = []
    lines = markdown_content.splitlines()

    skip_section = False
    boilerplate_patterns_markdown_expanded = [ # Vastly expanded boilerplate patterns
        r"©\s*20\d{2}\s*-\s*20\d{2}\s*PwC.*All rights reserved",
        r"PwC refers to the PwC network.*",
        r"Legal notices",
        r"Privacy",
        r"Cookie policy",
        r"Legal disclaimer",
        r"Terms and conditions",
        r"Support",
        r"Contact Us",
        r"By submitting your email address.*Privacy Statement",
        r"This site uses cookies.*cookie policy",
        r"Print Current Page",
        r"Print Corporate Tax Summary",
        r"Print Individual Tax Summary",
        r"Advanced Print",
        r"TOP",
        r"Worldwide Tax Summaries",
        r"Home",
        r"Quick Charts",
        r"Interactive Map",
        r"Archives",
        r"Glossary",
        r"Albania contacts", # Example, but will be generalized below
        r"Albania News",     # Example, generalized below
        r"### Albania Tax Alerts.*", # Generalized below
        r"### Doing Business and Investing in Albania.*", # Generalized
        r"### PwC Albania.*", # Generalized
        r"### PwC's Pillar Two Country Tracker.*", # Generalized
        r"### Global Tax Talk.*", # Generalized
        r"Territory",
        r"Select up to 5 territories",
        r"Select topic areas",
        r"Select your format",
        r"Cancel\s*Print",
        r"Error!.*Your message was not sent.*",
        r"Success!.*Your message has been sent.*",
        r"##### Contact Us",
        r"Contacts",
        r"News",
        r"Print",
        r"Search",
        r"Advanced Print",
        r"Back\(branch-income\.html#\)", # "Back" links specifically
        r"\[!\[.*?\]\(.*?\)\]\(.*?\)", # Regex for image links in Markdown (like PwC logo)
        r"\* \[.*?\]\(.*?\)",        # Regex for list items that are also links
        r"\+ \[.*?\]\(.*?\)",        # More list item/link variations
        r"^\* A$",                    # Start of country lists - "A", "B", "C" markers
        r"^\* B$",
        r"^\* C$",
        r"^\* Territory$",             # Territory dropdown label in lists
        r"^\s*Name$",                  # Contact form labels
        r"^\s*Email$",
        r"^\s*Subject$",
        r"^\s*Message$",
        r"Cancel\s*Send",             # Contact form buttons
        r"CW\s*Chris Wooley.*",        # Chris Wooley contact block, generalized below
        r"WWTS Operations Director, PwC US.*", # Chris Wooley block, generalized
        r"Please contact for general WWTS inquiries.*", # Chris Wooley block, generalized
        r"Territory\s*Albania\s*Algeria.*Zambia", # Full country list block - very aggressive removal
        r"Territory\s*Bahrain\s*Bangladesh.*Bulgaria", # Another block of countries
        r"Territory\s*Cabo Verde.*Czech Republic",
        r"Territory\s*Denmark.*Dominican Republic",
        r"Territory\s*Ecuador.*Ethiopia",
        r"Territory\s*Finland.*France",
        r"Territory\s*Gabon.*Guyana",
        r"Territory\s*Honduras.*Hungary",
        r"Territory\s*Iceland.*Ivory Coast \(Côte d'Ivoire\)",
        r"Territory\s*Jamaica.*Jordan",
        r"Territory\s*Kazakhstan.*Kuwait",
        r"Territory\s*Lao PDR.*Luxembourg",
        r"Territory\s*Macau SAR.*Myanmar",
        r"Territory\s*Namibia, Republic of.*Norway",
        r"Territory\s*Oman.*Puerto Rico",
        r"Territory\s*Qatar.*Rwanda",
        r"Territory\s*Saint Lucia.*Switzerland",
        r"Territory\s*Taiwan.*Turkey",
        r"Territory\s*Uganda.*Uzbekistan, Republic of",
        r"Territory\s*Venezuela.*Zambia",
        r"^\s*\* \[!\[.*?Overview.*?\]\(.*?overview-inactive-nav-icon.*?\).*?Overview.*?\]\(.*?\)", # Overview menu item regex
        r"^\s*\* \[!\[.*?Corporate.*?\]\(.*?corporate-active-nav-icon.*?\).*?Corporate.*?\]\(.*?\)", # Corporate menu item regex
        r"^\s*\* \[!\[.*?Individual.*?\]\(.*?individual-inactive-nav-icon.*?\).*?Individual.*?\]\(.*?\)", # Individual menu regex
        r"^Albania$", # Standalone country name in menus
        r"^Algeria$", # ... and so on, for common countries appearing in menus (you might need to add more)
        r"^Angola$",
        r"^Argentina$",
        r"^Armenia$",
        r"^Australia$",
        r"^Austria$",
        r"^Azerbaijan$",
        r"^Bahrain$",
        r"^Bangladesh$",
        r"^Barbados$",
        r"^Belgium$",
        r"^Bermuda$",
        r"^Bolivia$",
        r"^Bosnia and Herzegovina$",
        r"^Botswana$",
        r"^Brazil$",
        r"^Bulgaria$",
        r"^Cabo Verde$",
        r"^Cambodia$",
        r"^Cameroon, Republic of$",
        r"^Canada$",
        r"^Cayman Islands$",
        r"^Chad$",
        r"^Chile$",
        r"^China, People's Republic of$",
        r"^Colombia$",
        r"^Congo, Democratic Republic of the$",
        r"^Congo, Republic of$",
        r"^Costa Rica$",
        r"^Croatia$",
        r"^Cyprus$",
        r"^Czech Republic$",
        r"^Denmark$",
        r"^Dominican Republic$",
        r"^Ecuador$",
        r"^Egypt$",
        r"^El Salvador$",
        r"^Equatorial Guinea$",
        r"^Estonia$",
        r"^Eswatini$",
        r"^Ethiopia$",
        r"^Finland$",
        r"^France$",
        r"^Gabon$",
        r"^Georgia$",
        r"^Germany$",
        r"^Ghana$",
        r"^Gibraltar$",
        r"^Greece$",
        r"^Greenland$",
        r"^Guatemala$",
        r"^Guernsey, Channel Islands$",
        r"^Guyana$",
        r"^Honduras$",
        r"^Hong Kong SAR$",
        r"^Hungary$",
        r"^Iceland$",
        r"^India$",
        r"^Indonesia$",
        r"^Iraq$",
        r"^Ireland$",
        r"^Isle of Man$",
        r"^Israel$",
        r"^Italy$",
        r"^Ivory Coast \(Côte d'Ivoire\)$",
        r"^Jamaica$",
        r"^Japan$",
        r"^Jersey, Channel Islands$",
        r"^Jordan$",
        r"^Kazakhstan$",
        r"^Kenya$",
        r"^Korea, Republic of$",
        r"^Kosovo$",
        r"^Kuwait$",
        r"^Lao PDR$",
        r"^Latvia$",
        r"^Lebanon$",
        r"^Libya$",
        r"^Liechtenstein$",
        r"^Lithuania$",
        r"^Luxembourg$",
        r"^Macau SAR$",
        r"^Madagascar$",
        r"^Malaysia$",
        r"^Malta$",
        r"^Mauritania$",
        r"^Mauritius$",
        r"^Mexico$",
        r"^Moldova$",
        r"^Mongolia$",
        r"^Montenegro$",
        r"^Morocco$",
        r"^Mozambique$",
        r"^Myanmar$",
        r"^Namibia, Republic of$",
        r"^Netherlands$",
        r"^New Caledonia$",
        r"^New Zealand$",
        r"^Nicaragua$",
        r"^Nigeria$",
        r"^North Macedonia$",
        r"^Norway$",
        r"^Oman$",
        r"^Pakistan$",
        r"^Palestinian territories$",
        r"^Panama$",
        r"^Papua New Guinea$",
        r"^Paraguay$",
        r"^Peru$",
        r"^Philippines$",
        r"^Poland$",
        r"^Portugal$",
        r"^Puerto Rico$",
        r"^Qatar$",
        r"^Romania$",
        r"^Rwanda$",
        r"^Saint Lucia$",
        r"^Saudi Arabia$",
        r"^Senegal$",
        r"^Serbia$",
        r"^Singapore$",
        r"^Slovak Republic$",
        r"^Slovenia$",
        r"^South Africa$",
        r"^Spain$",
        r"^Sweden$",
        r"^Switzerland$",
        r"^Taiwan$",
        r"^Tanzania$",
        r"^Thailand$",
        r"^Timor-Leste$",
        r"^Trinidad and Tobago$",
        r"^Tunisia$",
        r"^Turkey$",
        r"^Uganda$",
        r"^Ukraine$",
        r"^United Arab Emirates$",
        r"^United Kingdom$",
        r"^United States$",
        r"^Uruguay$",
        r"^Uzbekistan, Republic of$",
        r"^Venezuela$",
        r"^Vietnam$",
        r"^Zambia$",
        r"^Contacts$", # "Contacts" section
        r"^News$",     # "News" section
        r"^Print$",    # "Print" section


        # Generalized patterns (be careful, might over-remove if too broad)
        r"^.*PwC.*$", # Lines containing "PwC" (might remove valid text, use cautiously)
        r"^\s*\*.*Back.*$", # "Back" links in lists
        r"^\s*\+.*Back.*$", # More "Back" link variations
        r"^\s*\[.*?\]\(branch-income\.html#\)$", # Even more specific "Back" link pattern
        r"^\s*\[.*?\]\(.*?\)$", # VERY aggressive: any line that's a Markdown link (be super careful!)
        r"^\s*\*.*", # Very aggressive: any line starting with a list marker '*' (might remove valid lists, use with caution)
        r"^\s*\+.*", # Very aggressive: any line starting with a list marker '+' (use with caution)
        r"^\s*\[.*?\)", # Aggressive: lines starting with '[' and containing ')' (list items with links?)

        # Add more patterns as you identify more boilerplate in your Markdown output
    ]


    tax_related_headings_markdown = [ # Same tax headings list as before
        "## Tax Residency Rules",
        "## Tax Year",
        "## Personal Income Tax",
        "## Corporate Tax",
        "## Capital Gains Tax",
        "## VAT/GST",
        "## Digital Nomad Visa",
        "## Special Economic Zones",
        "## Double Taxation Agreements",
        "## Overview",
        "### Significant developments",
        "### Taxes on corporate income",
        "### Corporate residence",
        "### Other taxes",
        "### Branch income",
        "### Income determination",
        "### Deductions",
        "### Group taxation",
        "### Tax credits and incentives",
        "### Withholding taxes",
        "### Tax administration",
        "### Other issues",
        "### Taxes on personal income",
        "### Residence",
        "### Foreign tax relief and tax treaties",
        "### Other tax credits and incentives",
        "### Sample personal income tax calculation"
    ]


    for line in lines:
        line = line.strip()
        if not line:
            continue

        is_boilerplate = False
        for pattern in boilerplate_patterns_markdown_expanded: # Use expanded pattern list
            if re.search(pattern, line, re.IGNORECASE | re.DOTALL):
                is_boilerplate = True
                break
        if is_boilerplate:
            continue

        is_tax_heading = False
        for heading in tax_related_headings_markdown:
             if line.startswith(heading):
                 is_tax_heading = True
                 break

        if is_tax_heading:
            cleaned_lines.append(line)
            skip_section = False
        elif not skip_section:
            cleaned_lines.append(line)


    return "\n".join(cleaned_lines).strip()


def process_markdown_file(input_filepath, output_filepath, country_name):
    """
    Processes a single Markdown file: reads content, extracts core tax description from Markdown, and saves.
    (Same process_markdown_file as before).
    """
    try:
        with open(input_filepath, 'r', encoding='utf-8') as md_file:
            markdown_content = md_file.read()

        extracted_tax_content = extract_core_tax_description_markdown(markdown_content, country_name)

        with open(output_filepath, 'w', encoding='utf-8') as out_file:
            out_file.write(extracted_tax_content)
        print(f"Processed & Saved Tax Content (Markdown Cleaning - Aggressive): {input_filepath} -> {output_filepath}")


    except Exception as e:
        print(f"Error processing file {input_filepath}: {e}")


def convert_markdown_folder_to_tax_markdown_aggressive_markdown_input(input_folder, output_folder):
    """
    Loops through input Markdown folder, processes each Markdown file, and saves aggressively cleaned Markdown.
    (Same folder traversal function as before, just using the new process_markdown_file and function names).
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for root, dirs, files in os.walk(input_folder):
        relative_path = os.path.relpath(root, input_folder)
        output_subdir = os.path.join(output_folder, relative_path)
        os.makedirs(output_subdir, exist_ok=True)

        for file in files:
            if file.lower().endswith('.md'):
                input_filepath = os.path.join(root, file)
                output_filepath = os.path.join(output_subdir, file)
                country_name = os.path.splitext(file)[0].replace('_', ' ')
                process_markdown_file(input_filepath, output_filepath, country_name)

def main():
    input_folder = "taxsummaries.markdown"  # Folder with Markdown files from previous conversion
    output_folder = "tax_markdown_folder_markdown_aggressive_expanded" # New output folder name

    if not os.path.exists(input_folder):
        print(f"Error: Input folder '{input_folder}' does not exist.")
        return

    convert_markdown_folder_to_tax_markdown_aggressive_markdown_input(input_folder, output_folder)
    print("\nMarkdown to Aggressively Cleaned Tax Markdown (Markdown Input) conversion completed.")


if __name__ == "__main__":
    main()