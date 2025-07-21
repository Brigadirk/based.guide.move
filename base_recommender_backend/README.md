# Base Recommender – Backend (FastAPI)

This directory contains the Python backend that powers the Next.js frontend.
It turns a profile JSON produced by the web-app into a prompt, forwards it to
Perplexity AI, and returns the response.  It also keeps a local cache of
currency-exchange rates (refreshed every 24 h).

---
## Prerequisites

* Python 3.11+
* A `.env` file with at least:
  ```
  # .env
  PERPLEXITY_API_KEY=your_perplexity_key
  OPEN_EXCHANGE_API_KEY=your_openexchange_key
  ```

Optional env vars and their defaults:
| Variable | Default | Purpose |
|----------|---------|---------|
| `PERPLEXITY_MODEL` | `pplx-labs` | First-choice Perplexity model |
| `PERPLEXITY_FALLBACK_MODEL` | `pplx-deep-research` | Automatic fallback if the first model is unavailable |
| `PERPLEXITY_TEMPERATURE` | `0.2` | Generation creativity |
| `PERPLEXITY_TOP_P` | `1` | Nucleus sampling |
| `EXCHANGE_UPDATE_INTERVAL_HOURS` | `24` | FX refresh interval |

---
## Setup

```bash
# inside repository root
cd base_recommender_backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

---
## Running

### Start the API server
```bash
uvicorn app:app --reload  # http://localhost:5001/api/v1/ping
```

### One-off JSON → Perplexity call
```bash
python app.py --test path/to/profile.json
```

### Inspect only the generated prompt (no API call)
```bash
# full narrative **plus** raw JSON appendix
python app.py --output path/to/profile.json

# narrative ONLY (omit appendix)
python app.py --output path/to/profile.json --no-appendix
```

---
## Scheduled tasks
On startup the app pulls the latest currency-exchange rates and schedules an
`apscheduler` job to refresh them every 24 hours (configurable).

---
## Tests
Pytest suite lives in `tests/` and runs entirely offline.

```bash
pytest                # run all tests
pytest -k validator   # run a subset
```

---
## Project layout (key parts)
```
.
├── app.py                         # FastAPI entrypoint & CLI helpers
├── api/
│   └── routes.py                  # API endpoints
│   └── perplexity.py              # Perplexity client wrapper
├── exchange_rate_fetcher/
│   └── exchange_rate_service.py   # FX fetch/cache/convert utilities
├── modules/
│   ├── schemas.py                 # Pydantic models
│   ├── validator.py               # Validation helper
│   └── prompt_generator.py        # JSON → prompt logic
└── tests/                         # pytest suite
```

---
## License
MIT (see root repository license) 