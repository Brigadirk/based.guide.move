import os
import argparse
from pathlib import Path
from typing import Dict, Optional, List, Any
from pydantic import BaseModel
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.language_models import BaseLLM
from langchain_core.outputs import LLMResult, Generation
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

google_api_key = os.getenv("GOOGLE_API_KEY")

# Step 1: Define Pydantic Models
class TaxInfo(BaseModel):
    content: Optional[str] = None

class CountryTaxData(BaseModel):
    general_info: str
    individual: TaxInfo
    corporate: TaxInfo

# Step 2: Helper Function to Read Markdown Files
def read_md_file(file_path: Path) -> Optional[str]:
    if file_path.exists():
        with open(file_path, "r") as f:
            return f.read()
    return None

# Step 3: Load Data for a Single Country
def load_country_data(country_folder: Path) -> CountryTaxData:
    country_name = country_folder.name
    general_info = read_md_file(country_folder / f"{country_name}.md") or "No general info available."
    individual_data = TaxInfo(content=read_md_file(country_folder / "individual.md"))
    corporate_data = TaxInfo(content=read_md_file(country_folder / "corporate.md"))
    return CountryTaxData(
        general_info=general_info,
        individual=individual_data,
        corporate=corporate_data
    )

# Step 4: Generate and Save Embeddings for Each Country
def generate_country_embeddings(country_folder: Path, embeddings_folder: Path):
    country_name = country_folder.name
    embeddings_file = embeddings_folder / f"{country_name}.faiss"

    if embeddings_file.exists():
        #print(f"Embeddings for {country_name} already exist.")
        return

    print(f"Generating embeddings for {country_name}...")
    country_data = load_country_data(country_folder)

    # Combine all text data for the country
    texts = [
        f"Country: {country_name}\nGeneral Info: {country_data.general_info}",
        f"Individual Tax Info: {country_data.individual.content}",
        f"Corporate Tax Info: {country_data.corporate.content}"
    ]

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_texts(texts, embeddings)

    # Save embeddings for the country
    vector_store.save_local(embeddings_file)
    print(f"Embeddings for {country_name} saved to {embeddings_file}")

# Step 5: Load Embeddings for Specific Countries
def load_country_embeddings(countries: List[str], embeddings_folder: Path):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_stores = []

    for country in countries:
        embeddings_file = embeddings_folder / f"{country}.faiss"
        if embeddings_file.exists():
            vector_store = FAISS.load_local(embeddings_file, embeddings, allow_dangerous_deserialization=True)
            vector_stores.append(vector_store)
        else:
            print(f"No embeddings found for {country}.")

    # Combine all vector stores into one
    if vector_stores:
        combined_store = vector_stores[0]
        for store in vector_stores[1:]:
            combined_store.merge_from(store)
        return combined_store
    else:
        raise ValueError("No embeddings found for the specified countries.")

# Step 6: Set Up RAG System
def setup_rag_system(vector_store: FAISS):
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")
    genai.configure(api_key=google_api_key)
    google_llm = genai.GenerativeModel("models/gemini-2.0-flash")

    class GoogleLLM(BaseLLM):
        def _generate(self, prompts: List[str], **kwargs: Any) -> LLMResult:
            responses = []
            for prompt in prompts:
                response = google_llm.generate_content(prompt)
                responses.append(Generation(text=response.text))
            return LLMResult(generations=[responses])

        @property
        def _llm_type(self) -> str:
            return "google-generativeai"

    qa = RetrievalQA.from_chain_type(
        llm=GoogleLLM(),
        chain_type="stuff",
        retriever=vector_store.as_retriever()
    )
    return qa


# Step 7: Extract Countries from Query
def extract_countries_from_query(query: str, available_countries: List[str]) -> List[str]:
    countries_in_query = []
    for country in available_countries:
        if country.lower() in query.lower():
            countries_in_query.append(country)
    return countries_in_query[:2]  # Limit to 2 countries


# Step 8: Main Function
def main(query: Optional[str] = None, country1: Optional[str] = None, country2: Optional[str] = None):
    base_folder = Path("./backend/base_recommender/tax_data")
    embeddings_folder = Path("./backend/base_recommender/tax_embeddings")
    available_countries = [folder.name for folder in base_folder.iterdir() if folder.is_dir()]

    # Generate embeddings for all countries (if not already done)
    for country_folder in base_folder.iterdir():
        if country_folder.is_dir():
            generate_country_embeddings(country_folder, embeddings_folder)

    # If no query is provided, check for command-line input
    if query is None:
        parser = argparse.ArgumentParser(description="Query the RAG system for tax information.")
        parser.add_argument("query", type=str, help="Your query about tax information.")
        parser.add_argument("--country1", type=str, help="First country for context.")
        parser.add_argument("--country2", type=str, help="Second country for context.")
        args = parser.parse_args()
        query = args.query
        country1 = args.country1
        country2 = args.country2

    # Validate the provided countries
    if not country1 or not country2:
        print("Please provide two valid countries as context.")
        return None

    if country1 not in available_countries or country2 not in available_countries:
        print(f"One or both countries are not available. Available countries: {', '.join(available_countries)}")
        return None

    # Use the provided countries as context
    relevant_countries = [country1, country2]
    print(f"Loading embeddings for: {', '.join(relevant_countries)}")
    vector_store = load_country_embeddings(relevant_countries, embeddings_folder)

    # Set up the RAG system
    qa = setup_rag_system(vector_store)

    # Query the system
    if query:
        response = qa.invoke({"query": query})
        print("Response:", response)
        return response
    else:
        print("No query provided.")
        return None

if __name__ == "__main__":
    main()