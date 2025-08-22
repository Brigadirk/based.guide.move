FROM python:3.11-slim


WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml first for better caching
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Copy source code
COPY . .

# Create data directory for exchange rates
RUN mkdir -p /app/data

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Expose port
EXPOSE ${PORT:-3000}

# Run the application
WORKDIR /app/src
ENV PYTHONPATH=.
# Create a startup script to handle PORT env var
RUN echo '#!/bin/sh\nexec uvicorn app:app --host 0.0.0.0 --port ${PORT:-3000}' > /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
