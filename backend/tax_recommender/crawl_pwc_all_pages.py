import asyncio
import os
import shutil
import uuid
from typing import List
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
import requests
from xml.etree import ElementTree

def clear_cache():
    cache_dir = ".crawl4ai_cache"  # Default cache directory
    if os.path.exists(cache_dir):
        shutil.rmtree(cache_dir)
        print(f"Cache cleared: {cache_dir}")
    else:
        print("No cache directory found.")

async def crawl_sequential(urls: List[str]):
    print("\n=== Sequential Crawling with Session Reuse ===")

    browser_config = BrowserConfig(
        headless=True,
        extra_args=["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
    )

    # Create the crawler (opens the browser)
    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.start()

    try:
        session_id = str(uuid.uuid4())  # Generate a unique session ID for each run
        for url in urls:
            crawl_config = CrawlerRunConfig(
                markdown_generator=DefaultMarkdownGenerator(),
                css_selector="#territoryMain",
                excluded_tags=["nav", "i", "input", "a"],
                cache_mode="none"  # Disable caching
            )
            
            result = await crawler.arun(
                url=url,
                config=crawl_config,
                session_id=session_id
            )
            if result.success:
                print(f"Successfully crawled: {url}")
                country = extract_country_from_url(url)
                individual_or_corporate = extract_corporate_or_individual_from_url(url)
                if country:
                    if individual_or_corporate:
                        os.makedirs(f"markdown/{country}/{individual_or_corporate}", exist_ok=True)
                    else:
                        os.makedirs(f"markdown/{country}/", exist_ok=True)
                    relevant_content = result.markdown_v2.raw_markdown
                    save_as_markdown(relevant_content, country, individual_or_corporate, url)
            else:
                print(f"Failed: {url} - Error: {result.error_message}")
    finally:
        await crawler.close()

def extract_country_from_url(url: str) -> str:
    parts = url.split('/')
    if len(parts) > 3:
        return parts[3]
    return None

def extract_corporate_or_individual_from_url(url: str) -> str:
    parts = url.split('/')
    if len(parts) > 4:
        return parts[4]
    return None

def save_as_markdown(content: str, country: str, individual_or_corporate: str, url: str):
    filename = url.split('/')[-1] or "document"
    filename = filename.replace('.html', '.md')
    if individual_or_corporate:
        filepath = f"markdown/{country}/{individual_or_corporate}/{filename}.md"
    else:
        filepath = f"markdown/{country}/{filename}.md"

    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Saved Markdown: {filepath}")

def get_tax_summaries_urls():
    sitemap_url = "https://taxsummaries.pwc.com/sitemap.xml"
    try:
        response = requests.get(sitemap_url)
        response.raise_for_status()
        root = ElementTree.fromstring(response.content)
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('.//ns:loc', namespace)]
        return urls
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

async def main():
    clear_cache()  # Clear any existing cache
    urls = get_tax_summaries_urls()
    if urls:
        print(f"Found {len(urls)} URLs to crawl")
        await crawl_sequential(urls)
    else:
        print("No URLs found to crawl")

if __name__ == "__main__":
    asyncio.run(main())