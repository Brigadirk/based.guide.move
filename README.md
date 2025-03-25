# OECD Tax Data Fetcher

<<<<<<< HEAD
Second iteration of based.guide - A comprehensive guide to global mobility and taxation.

## Tech Stack

### Frontend (Next.js)
- Framework: Next.js 14 with App Router
- Database & Auth: Supabase
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- State Management: React Query
- Forms: react-hook-form with zod validation
- Icons: Lucide Icons
- HTTP Client: Axios
- Hosting: Vercel

### Backend (Python)
- Framework: FastAPI
- Tasks: Cron jobs, LLM processing, Tax analysis
- Testing: pytest
- Code style: black, flake8
- Hosting: TBD

## Project Structure
```
/
├── frontend/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── lib/            
│   │   ├── supabase/   # Supabase client & utils
│   │   ├── api/        # API client & endpoints
│   │   └── utils/      # Utility functions
│   └── styles/         # Global styles
│
├── backend/
│   ├── app/           
│   │   ├── core/       # Core functionality
│   │   ├── tasks/      # Cron jobs & tasks
│   │   ├── services/   # External services integration
│   │   └── api/        # API endpoints
│   └── tests/          # Test files
│
└── docs/              # Documentation
```
=======
This system fetches tax information from the OECD API, providing similar data to what is available on taxsummaries.pwc.com.

## Features

- Fetch corporate tax rates across countries
- Retrieve personal income tax data
- Get VAT/GST rates information
- Access tax revenue statistics
- Export data to CSV files for further analysis
>>>>>>> 7fce1ef (status)

## Installation

<<<<<<< HEAD
### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase CLI (optional)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/based.guide.move.git
cd based.guide.move
```

2. Frontend setup:
```bash
cd frontend
cp .env.example .env.local  # Configure your env variables
npm install
npm run dev
```

3. Backend setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Development

The easiest way to start development is to use the provided development script:
=======
1. Clone this repository:
   ```
   git clone https://github.com/yourusername/oecd-tax-fetcher.git
   cd oecd-tax-fetcher
   ```
>>>>>>> 7fce1ef (status)

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

<<<<<<< HEAD
## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```
OPENAI_API_KEY=your-api-key
# Add other necessary API keys and configuration
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

[License Type] - See LICENSE file for details

## TODO
- Add special economic zones like Prospera
- Add immigration process info
- Check the scrape for accuracy on 10 different countries
- Chat with Mr. Pro Bonobo

=======
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
>>>>>>> 7fce1ef (status)
