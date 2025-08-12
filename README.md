# Mr Pro Bonobo

BasedGuide is a comprehensive, intelligent platform that helps individuals and families plan international relocations with a focus on tax implications, visa requirements, and practical relocation considerations. The system combines sophisticated form-based data collection with AI-powered analysis to provide personalized migration guidance.

## 🌟 Key Features

### 🎯 **Intelligent User Profiling**
- **Personal Information**: Multi-nationality support, family composition, current residency status
- **Education & Career**: Academic background, professional qualifications, military service tracking
- **Financial Profile**: Income sources, assets, liabilities with currency conversion
- **Family Analysis**: Partner and dependent visa requirements with EU freedom of movement detection
- **Destination Planning**: Country-specific visa and tax analysis

### 🧠 **AI-Powered Analysis**
- **Personalized Recommendations**: Context-aware advice based on complete user profile
- **Visa Strategy**: Complex family visa coordination and timeline planning
- **Tax Optimization**: Cross-border tax implications and compliance strategies
- **Alternative Pathways**: Smart detection of simplified paths for visa-free users

### 🌍 **Global Coverage**
- **EU Integration**: Special handling for EU citizenship and freedom of movement
- **Multi-Currency Support**: Real-time exchange rates and currency conversion
- **Country-Specific Logic**: Tailored questionnaires and analysis per destination
- **Family Complexity**: Mixed-nationality family visa requirement analysis

## 📁 Project Structure

```
basedguide2/
├── base_recommender_next_js/          # Main Next.js Frontend Application
│   ├── app/                           # Next.js 14 App Router
│   ├── components/                    # React Components
│   │   ├── features/                  # Form sections (personal, finance, etc.)
│   │   ├── ui/                        # Reusable UI components
│   │   └── auth/                      # Authentication components
│   ├── lib/                           # Utilities and business logic
│   │   ├── stores/                    # Zustand state management
│   │   ├── hooks/                     # Custom React hooks
│   │   └── utils/                     # Helper functions (EU, visa, family)
│   └── data/                          # Static data (countries, EU members)
│
├── base_recommender_backend/          # FastAPI Backend API
│   ├── api/                           # API endpoints and routes
│   ├── modules/                       # Core business logic
│   │   ├── story_generator.py         # AI context generation
│   │   ├── eu_utils.py               # EU citizenship utilities
│   │   ├── currency_utils.py         # Currency conversion
│   │   └── schemas.py                # Pydantic models
│   ├── exchange_rate_fetcher/         # Currency data management
│   ├── schemas/                       # JSON Schema definitions
│   └── tests/                         # Backend test suite
│
├── base_recommender/                  # Legacy Streamlit Application (DEPRECATED)
│   └── st_app.py                     # Reference implementation
│
└── docs/                             # Documentation
```

## 🛠 Technology Stack

### **Frontend (Next.js Application)**
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for form data persistence
- **Forms**: react-hook-form with Zod validation
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React

### **Backend (FastAPI API)**
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Database**: PostgreSQL with SQLAlchemy ORM (planned)
- **Authentication**: JWT with python-jose (planned)
- **Email**: Postmark integration (planned)
- **Currency**: Real-time exchange rate fetching
- **Validation**: Pydantic models with JSON Schema

### **AI Integration**
- **Context Generation**: Sophisticated story generation for AI consumption
- **External APIs**: Perplexity AI for analysis (configurable)
- **Prompt Engineering**: Structured prompts with user context and preferences

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- Git

### **Frontend Setup (Next.js)**

```bash
cd base_recommender_next_js

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### **Backend Setup (FastAPI)**

```bash
cd base_recommender_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Run development server
python app.py
```

The API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`

## 🎯 Core Functionality

### **1. Intelligent Form System**
The platform guides users through a comprehensive questionnaire covering:

- **Personal Information**: Citizenship, residency, family composition
- **Education & Skills**: Degrees, certifications, language proficiency, military service
- **Financial Profile**: Income, assets, liabilities with multi-currency support
- **Destination Planning**: Target country, move type, timeline preferences
- **Family Visa Analysis**: Partner and dependent visa requirements
- **Tax Planning**: Deductions, credits, pension contributions, future plans

### **2. Smart Conditional Logic**
- **EU Citizenship Detection**: Automatic EU freedom of movement analysis
- **Family Visa Coordination**: Complex multi-member visa requirement detection
- **Alternative Pathways**: Simplified questionnaires for visa-free + tax-uninterested users
- **Context-Aware Questions**: Dynamic form adaptation based on user profile

### **3. AI Context Generation**
The backend transforms form data into sophisticated narratives for AI analysis:

```python
# Example generated context
"The individual plans a permanent move to Germany. As an EU citizen, they have freedom of movement to Germany. However, their spouse/partner will require family reunion/dependent visas. EU family reunion directives may provide beneficial pathways for family members. They prefer to coordinate all family visa applications together. Their main concerns include document preparation and spouse work authorization."
```

### **4. Comprehensive Analysis**
- **Visa Strategy**: Timeline coordination, application sequencing, document requirements
- **Tax Optimization**: Cross-border implications, residency planning, compliance strategies
- **Practical Guidance**: Healthcare, education, employment, housing considerations
- **Family Coordination**: Multi-member planning with different visa statuses

## 🔧 API Endpoints

### **Core Story Generation**
- `POST /section/personal` - Personal information analysis
- `POST /section/education` - Education and skills summary
- `POST /section/residency` - Residency intentions with family visa analysis
- `POST /section/finance` - Financial profile with currency conversion
- `POST /section/social-security` - Pension and social security planning
- `POST /section/tax-deductions` - Tax optimization strategies
- `POST /section/future-plans` - Future financial planning

### **Utility Services**
- `GET /exchange-rates` - Current currency exchange rates
- `POST /validate-profile` - Complete profile validation
- `GET /countries` - Supported countries and metadata

## 📊 Data Models

### **Core Profile Structure**
```json
{
  "personalInformation": {
    "nationalities": [{"country": "string", "willingToRenounce": "boolean"}],
    "currentResidency": {"country": "string", "status": "string"},
    "relocationPartnerInfo": {"partnerNationalities": [...], "relationshipType": "string"},
    "relocationDependents": [{"nationalities": [...], "relationship": "string", "age": "number"}]
  },
  "residencyIntentions": {
    "destinationCountry": {"country": "string", "moveType": "string"},
    "familyVisaPlanning": {
      "applicationTimeline": "together|sequential|flexible",
      "concerns": ["documentPreparation", "applicationCosts", ...]
    },
    "alternativeInterests": ["culturalIntegration", "healthcareSystem", ...]
  },
  "finance": {
    "skipDetails": "boolean",
    "totalWealth": {"currency": "string", "total": "number"},
    "incomeSources": [...],
    "assets": [...],
    "liabilities": [...]
  }
}
```

## 🎨 User Experience Flow

### **1. Profile Building**
1. **Personal Information**: User enters citizenship, family details
   - System detects EU status and displays appropriate badges
   - Family composition analysis for visa planning

2. **Destination Selection**: User chooses target country
   - Real-time visa requirement analysis
   - Family visa complexity assessment
   - EU freedom of movement detection

3. **Adaptive Questionnaire**: System presents relevant sections
   - **Complex Cases**: Full visa and tax analysis
   - **Simple Cases**: Alternative interests and practical questions
   - **Family Cases**: Coordination and timeline planning

### **2. AI Analysis**
1. **Context Generation**: Backend creates comprehensive narrative
2. **AI Processing**: External AI analyzes complete user context
3. **Personalized Recommendations**: Tailored advice delivery

### **3. Results & Planning**
1. **Visa Strategy**: Step-by-step visa application guidance
2. **Tax Planning**: Cross-border optimization strategies
3. **Practical Guidance**: Location-specific living guidance
4. **Timeline Coordination**: Family relocation synchronization

## 🧪 Testing & Development

### **Frontend Testing**
```bash
cd base_recommender_next_js
npm run test        # Run Jest tests
npm run lint        # ESLint checking
npm run type-check  # TypeScript validation
```

### **Backend Testing**
```bash
cd base_recommender_backend
pytest              # Run test suite
python -m pytest tests/ -v
```

## 📈 Architecture Decisions

### **Why Next.js + FastAPI?**
- **Next.js**: Superior developer experience, built-in optimization, flexible routing
- **FastAPI**: Automatic API documentation, excellent Python typing, high performance
- **Separation**: Clean API boundaries, independent scaling, technology flexibility

### **State Management with Zustand**
- **Persistence**: Form data survives page refreshes and navigation
- **Performance**: Minimal re-renders, optimized updates
- **Simplicity**: Less boilerplate than Redux, better TypeScript support

### **EU-First Design**
- **Recognition**: EU freedom of movement is a major migration pathway
- **Complexity**: EU family reunion directives require special handling
- **User Experience**: Immediate recognition of EU advantages

## 🗂 Legacy Reference (Streamlit App)

The `base_recommender/` directory contains the original Streamlit implementation. **This is now DEPRECATED** and serves only as a reference for:

- **Feature Completeness**: Ensuring the Next.js app covers all original functionality
- **Business Logic**: Understanding complex form interactions and conditional logic
- **AI Integration**: Reference implementation for story generation and context building
- **Validation**: Comparing outputs when debugging the Next.js implementation

**⚠️ Do not use the Streamlit app for production - it's maintained only as a development reference.**

## 🔮 Future Enhancements

### **Planned Features**
- **User Authentication**: Account creation, profile saving, session management
- **Database Integration**: PostgreSQL with user data persistence
- **Email Integration**: Postmark for notifications and report delivery
- **Enhanced AI**: Multiple AI provider support, custom prompt templates
- **Mobile App**: React Native implementation for mobile users
- **Advanced Analytics**: User journey tracking, conversion optimization

### **Technical Debt**
- **Database Migration**: Move from in-memory state to persistent storage
- **Authentication**: Implement secure user session management
- **Caching**: Redis for API response caching and performance
- **Monitoring**: Application performance and error tracking
- **Deployment**: Production CI/CD pipeline and infrastructure

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Follow Conventions**: Use existing code style and patterns
4. **Add Tests**: Ensure new features have appropriate test coverage
5. **Update Documentation**: Keep README and API docs current
6. **Submit Pull Request**: Detailed description of changes

### **Development Guidelines**
- **Frontend**: Follow React best practices, use TypeScript strictly
- **Backend**: Maintain API documentation, add proper error handling
- **Testing**: Write tests for new features, maintain coverage
- **Performance**: Consider impact on user experience and server resources

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions, bug reports, or feature requests:
- **Issues**: Create a GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check `/docs` directory for detailed guides

---

**BasedGuide** - Making international migration planning intelligent, comprehensive, and accessible. 🌍✈️🏠