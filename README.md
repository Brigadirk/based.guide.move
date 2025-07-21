# OECD Tax Data Fetcher

This system fetches tax information from the OECD API, providing similar data to what is available on taxsummaries.pwc.com.

## Features

- Fetch corporate tax rates across countries
- Retrieve personal income tax data
- Get VAT/GST rates information
- Access tax revenue statistics
- Export data to CSV files for further analysis

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/oecd-tax-fetcher.git
   cd oecd-tax-fetcher
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Basic Usage

```python
from oecd_tax_fetcher import OECDTaxFetcher

# Initialize the fetcher
fetcher = OECDTaxFetcher()

# Get corporate tax rates for all countries
corporate_tax_data = fetcher.get_corporate_tax_rates()

# Export the data to CSV
fetcher.export_to_csv(corporate_tax_data, "corporate_tax_rates")

# Get VAT rates for a specific country
vat_data = fetcher.get_vat_rates(country="USA")
fetcher.export_to_csv(vat_data, "usa_vat_rates")
```

### Command Line Usage

You can also run the script directly:

```
python oecd_tax_fetcher.py
```

This will fetch some example data and save it to the `tax_data_exports` directory.

## Available Methods

- `get_corporate_tax_rates(country=None, year=None)`: Fetch corporate tax rates
- `get_personal_income_tax(country=None, year=None)`: Fetch personal income tax data
- `get_vat_rates(country=None, year=None)`: Fetch VAT/GST rates
- `get_tax_revenue(country=None, year=None)`: Fetch tax revenue statistics
- `export_to_csv(data, filename)`: Export data to CSV file

## Data Sources

This tool uses the OECD API to fetch tax-related data. The API documentation can be found at:
https://data.oecd.org/api/

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
