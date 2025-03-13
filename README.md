# based.guide.move

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

## Quick Start

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

```bash
# Make the script executable (first time only)
chmod +x dev.sh

# Start both frontend and backend servers
./dev.sh
```

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

