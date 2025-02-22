import requests
from bs4 import BeautifulSoup
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

BASE_URL = "https://taxsummaries.pwc.com/"

def get_country_urls():
    """
    Uses Selenium to scrape the website homepage and get URLs for each country's tax summary page.

    Returns:
        dict: A dictionary mapping country names to their URLs, or None if error.
    """
    try:
        # Set up Selenium WebDriver
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')  # Run in headless mode (no GUI)
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

        # Load the website
        driver.get(BASE_URL)
        time.sleep(5)  # Wait for the page to load (adjust as needed)

        # Locate the country selector dropdown
        country_selector = driver.find_element(By.ID, 'country-selector')
        if not country_selector:
            print("Error: Country selector dropdown not found on the homepage.")
            driver.quit()
            return None

        # Extract country URLs
        country_urls = {}
        for option in country_selector.find_elements(By.TAG_NAME, 'option'):
            country_name = option.text.strip()
            country_path = option.get_attribute('value')
            if country_path and country_path != '#':  # Ignore default option and empty values
                country_urls[country_name] = BASE_URL.rstrip('/') + country_path

        driver.quit()
        return country_urls

    except Exception as e:
        print(f"Error: {e}")
        if 'driver' in locals():
            driver.quit()
        return None

def get_report_urls_and_types(country_url):
    """
    Scrapes a country page to find URLs and types of available tax reports.

    Args:
        country_url (str): URL of the country's tax summary page.

    Returns:
        dict: A dictionary mapping report types to their URLs, or None if error.
    """
    try:
        response = requests.get(country_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        report_links_container = soup.find('div', {'class': 'country-nav'})  # Container for report links
        if not report_links_container:
            print(f"Warning: Report links container not found on {country_url}. Skipping reports.")
            return {}  # Return empty dict to proceed with other countries

        report_urls = {}
        for link in report_links_container.find_all('a'):
            report_type = link.text.strip()
            report_path = link['href']
            if report_type and report_path:
                report_urls[report_type] = BASE_URL.rstrip('/') + report_path

        return report_urls

    except requests.exceptions.RequestException as e:
        print(f"Request Error for {country_url}: {e}")
        return None

def download_report(report_url, filepath):
    """
    Downloads the tax report content from the given URL and saves it as a .txt file.

    Args:
        report_url (str): URL of the tax report page.
        filepath (str): Path to save the .txt file.
    """
    try:
        response = requests.get(report_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        report_content_div = soup.find('div', {'class': 'content-block'})  # Main content block
        if not report_content_div:
            print(f"Warning: Report content block not found on {report_url}. Skipping download.")
            return

        # Extract text content, removing excessive whitespace
        report_text = report_content_div.get_text(separator='\n', strip=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report_text)
        print(f"Downloaded: {filepath}")

    except requests.exceptions.RequestException as e:
        print(f"Download Error for {report_url}: {e}")

def main():
    country_urls = get_country_urls()
    if not country_urls:
        print("Failed to retrieve country URLs. Exiting.")
        return

    output_root_dir = "tax_summaries_pwc"
    os.makedirs(output_root_dir, exist_ok=True)

    for country_name, country_url in country_urls.items():
        print(f"\nProcessing Country: {country_name}")
        report_urls_and_types = get_report_urls_and_types(country_url)
        if report_urls_and_types:
            country_dir = os.path.join(output_root_dir, country_name.replace('/', '_').replace('\\', '_'))  # Create country folder, sanitize name
            os.makedirs(country_dir, exist_ok=True)

            for report_type, report_url in report_urls_and_types.items():
                # Sanitize report type for filename
                report_filename = report_type.replace('/', '_').replace('\\', '_') + ".txt"
                filepath = os.path.join(country_dir, report_filename)
                download_report(report_url, filepath)
        else:
            print(f"No reports found for {country_name} or error retrieving report URLs.")

    print("\nTax summary download complete.")

if __name__ == "__main__":
    main()