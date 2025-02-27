import os
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

# Step 1: List Available Models
def list_available_models():
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")
    genai.configure(api_key=google_api_key)
    models = genai.list_models()
    for model in models:
        print(f"Model Name: {model.name}")
        print(f"Supported Methods: {model.supported_generation_methods}")
        print("-" * 40)

# Step 2: Define Pydantic Models
class TaxInfo(BaseModel):
    content: Optional[str] = None

class CountryTaxData(BaseModel):
    general_info: str
    individual: TaxInfo
    corporate: TaxInfo

# Step 3: Helper Function to Read Markdown Files
def read_md_file(file_path: Path) -> Optional[str]:
    if file_path.exists():
        with open(file_path, "r") as f:
            return f.read()
    return None

# Step 4: Load Data for a Single Country
def load_country_data(country_folder: Path) -> CountryTaxData:
    country_name = country_folder.name

    # Load general info from <country-name>.md
    general_info = read_md_file(country_folder / f"{country_name}.md") or "No general info available."

    # Load individual tax info from individual.md
    individual_file = country_folder / "individual.md"
    individual_data = TaxInfo(content=read_md_file(individual_file))

    # Load corporate tax info from corporate.md
    corporate_file = country_folder / "corporate.md"
    corporate_data = TaxInfo(content=read_md_file(corporate_file))

    return CountryTaxData(
        general_info=general_info,
        individual=individual_data,
        corporate=corporate_data
    )

# Step 5: Load Data for All Countries
def load_all_countries(base_folder: Path) -> Dict[str, CountryTaxData]:
    countries = {}
    for country_folder in base_folder.iterdir():
        if country_folder.is_dir():
            country_name = country_folder.name
            countries[country_name] = load_country_data(country_folder)
    return countries

from langchain_core.outputs import LLMResult, Generation  # Add Generation import

# Step 6: RAG System
def setup_rag_system(countries: Dict[str, CountryTaxData], embeddings_file: Path):
    # Check if embeddings file already exists
    if embeddings_file.exists():
        print("Loading embeddings from file...")
        vector_store = FAISS.load_local(
            embeddings_file,
            HuggingFaceEmbeddings(),
            allow_dangerous_deserialization=True  # Allow loading the FAISS index
        )
    else:
        print("Generating embeddings...")
        # Combine all text data into a single list
        all_texts = []
        for country_name, country_data in countries.items():
            all_texts.append(f"Country: {country_name}\nGeneral Info: {country_data.general_info}")
            all_texts.append(f"Individual Tax Info: {country_data.individual.content}")
            all_texts.append(f"Corporate Tax Info: {country_data.corporate.content}")

        # Create embeddings using HuggingFace
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_store = FAISS.from_texts(all_texts, embeddings)

        # Save the vector store to a file
        vector_store.save_local(embeddings_file)
        print(f"Embeddings saved to {embeddings_file}")

    # Set up the RAG system with Google Generative AI
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")
    genai.configure(api_key=google_api_key)
    google_llm = genai.GenerativeModel("models/gemini-2.0-flash")

    # Wrap Google Generative AI in a LangChain-compatible LLM
    class GoogleLLM(BaseLLM):
        def _generate(self, prompts: List[str], **kwargs: Any) -> LLMResult:
            responses = []
            for prompt in prompts:
                response = google_llm.generate_content(prompt)
                # Wrap each response in a Generation object
                responses.append(Generation(text=response.text))
            
            # Create an LLMResult object with the responses
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

import argparse  # Add this import

# Step 7: Main Function to Run the System
def main(query: Optional[str] = None):
    # Path to your tax data folder
    base_folder = Path("tax_data")

    # Path to save/load embeddings
    embeddings_file = Path("tax_embeddings")

    # Load all countries' data
    countries = load_all_countries(base_folder)

    # Set up the RAG system
    qa = setup_rag_system(countries, embeddings_file)

    # If no query is provided, check for command-line input
    if query is None:
        parser = argparse.ArgumentParser(description="Query the RAG system for tax information.")
        parser.add_argument("query", type=str, help="Your query about tax information.")
        args = parser.parse_args()
        query = args.query

    # Query the system
    if query:
        response = qa.invoke({"query": query})  # Use `invoke` instead of `run`
        print("Response:", response)
        return response  # Return the response for use in Streamlit
    else:
        print("No query provided.")
        return None

if __name__ == "__main__":
    main()