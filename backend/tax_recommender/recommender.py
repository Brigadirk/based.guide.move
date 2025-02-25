import os
from pathlib import Path
from typing import Dict, Optional
from pydantic import BaseModel
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# Step 1: Define Pydantic Models
class TaxInfo(BaseModel):
    tax_rates: Optional[str] = None
    deductions: Optional[str] = None
    compliance: Optional[str] = None
    incentives: Optional[str] = None

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
    # Load general info
    general_info = read_md_file(country_folder / "general_info.md") or "No general info available."

    # Load individual tax info
    individual_folder = country_folder / "individual"
    individual_data = TaxInfo(
        tax_rates=read_md_file(individual_folder / "tax_rates.md"),
        deductions=read_md_file(individual_folder / "deductions.md"),
        compliance=read_md_file(individual_folder / "compliance.md")
    )

    # Load corporate tax info
    corporate_folder = country_folder / "corporate"
    corporate_data = TaxInfo(
        tax_rates=read_md_file(corporate_folder / "tax_rates.md"),
        incentives=read_md_file(corporate_folder / "incentives.md"),
        compliance=read_md_file(corporate_folder / "compliance.md")
    )

    return CountryTaxData(
        general_info=general_info,
        individual=individual_data,
        corporate=corporate_data
    )

# Step 4: Load Data for All Countries
def load_all_countries(base_folder: Path) -> Dict[str, CountryTaxData]:
    countries = {}
    for country_folder in base_folder.iterdir():
        if country_folder.is_dir():
            country_name = country_folder.name
            countries[country_name] = load_country_data(country_folder)
    return countries

# Step 5: Set Up the RAG System
def setup_rag_system(countries: Dict[str, CountryTaxData], embeddings_file: Path):
    # Check if embeddings file already exists
    if embeddings_file.exists():
        print("Loading embeddings from file...")
        vector_store = FAISS.load_local(embeddings_file, OpenAIEmbeddings())
    else:
        print("Generating embeddings...")
        # Combine all text data into a single list
        all_texts = []
        for country_name, country_data in countries.items():
            all_texts.append(f"Country: {country_name}\nGeneral Info: {country_data.general_info}")
            all_texts.append(f"Individual Tax Rates: {country_data.individual.tax_rates}")
            all_texts.append(f"Corporate Tax Rates: {country_data.corporate.tax_rates}")
            # Add more fields as needed

        # Create embeddings and vector store
        embeddings = OpenAIEmbeddings()
        vector_store = FAISS.from_texts(all_texts, embeddings)

        # Save the vector store to a file
        vector_store.save_local(embeddings_file)
        print(f"Embeddings saved to {embeddings_file}")

    # Set up the RAG system
    qa = RetrievalQA.from_chain_type(
        llm=OpenAI(),
        chain_type="stuff",
        retriever=vector_store.as_retriever()
    )
    return qa

# Step 6: Main Function to Run the System
def main():
    # Path to your tax data folder
    base_folder = Path("tax_data")

    # Path to save/load embeddings
    embeddings_file = Path("tax_embeddings")

    # Load all countries' data
    countries = load_all_countries(base_folder)

    # Set up the RAG system
    qa = setup_rag_system(countries, embeddings_file)

    # Query the system
    query = "What are the corporate tax rates in Country 1?"
    response = qa.run(query)
    print("Response:", response)

if __name__ == "__main__":
    main()