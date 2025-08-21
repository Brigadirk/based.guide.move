#!/usr/bin/env python3
"""Exchange rates worker service for BasedGuide.

This worker periodically fetches exchange rates and stores them for use by the main application.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add the parent directory to the path to import shared modules
sys.path.append(str(Path(__file__).parent.parent.parent / "backend" / "src"))

from services.exchange_rate_service import fetch_and_save_latest_rates
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("/app/data/worker.log") if os.path.exists("/app/data") else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)


class ExchangeRateWorker:
    """Worker for fetching and storing exchange rates."""
    
    def __init__(self, interval_hours: int = 6):
        """Initialize the worker.
        
        Args:
            interval_hours: How often to fetch rates (in hours)
        """
        self.interval_hours = interval_hours
        self.running = False
    
    async def start(self):
        """Start the worker loop."""
        self.running = True
        logger.info(f"Starting exchange rate worker (interval: {self.interval_hours}h)")
        
        # Fetch initial rates
        await self.fetch_rates()
        
        # Start periodic fetching
        while self.running:
            await asyncio.sleep(self.interval_hours * 3600)  # Convert hours to seconds
            if self.running:
                await self.fetch_rates()
    
    async def stop(self):
        """Stop the worker."""
        logger.info("Stopping exchange rate worker")
        self.running = False
    
    async def fetch_rates(self):
        """Fetch and store exchange rates."""
        try:
            logger.info("Fetching exchange rates...")
            fetch_and_save_latest_rates(force=True)
            logger.info("Exchange rates updated successfully")
        except Exception as e:
            logger.error(f"Failed to fetch exchange rates: {e}")


async def main():
    """Main worker function."""
    # Get interval from environment variable
    interval_hours = int(os.getenv("EXCHANGE_RATE_INTERVAL_HOURS", "6"))
    
    worker = ExchangeRateWorker(interval_hours=interval_hours)
    
    try:
        await worker.start()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Worker error: {e}")
    finally:
        await worker.stop()


if __name__ == "__main__":
    asyncio.run(main())
