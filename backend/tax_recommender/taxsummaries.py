import os
import markdownify
from bs4 import BeautifulSoup

def html_to_markdown(html_content):
    """
    Converts HTML content to Markdown using markdownify.

    Args:
        html_content (str): The HTML content as a string.

    Returns:
        str: The converted Markdown content as a string.
    """
    return markdownify.markdownify(html_content, heading_style="ATX")

def convert_html_folder_to_markdown(input_folder, output_folder):
    """
    Loops through an input folder and its subfolders, converts HTML files to Markdown,
    and saves them in a parallel output folder structure.

    Args:
        input_folder (str): Path to the input folder containing HTML files.
        output_folder (str): Path to the output folder where Markdown files will be saved.
    """

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for root, dirs, files in os.walk(input_folder):
        # Create corresponding output subdirectory
        relative_path = os.path.relpath(root, input_folder)
        output_subdir = os.path.join(output_folder, relative_path)
        os.makedirs(output_subdir, exist_ok=True)

        for file in files:
            if file.lower().endswith(('.html', '.htm')):
                input_filepath = os.path.join(root, file)
                output_filename_md = os.path.splitext(file)[0] + ".md" # Replace .html with .md
                output_filepath = os.path.join(output_subdir, output_filename_md)

                try:
                    with open(input_filepath, 'r', encoding='utf-8') as html_file:
                        html_content = html_file.read()
                        markdown_content = html_to_markdown(html_content)

                    with open(output_filepath, 'w', encoding='utf-8') as md_file:
                        md_file.write(markdown_content)
                    print(f"Converted: {input_filepath} -> {output_filepath}")

                except Exception as e:
                    print(f"Error converting {input_filepath}: {e}")

def main():
    input_folder = "taxsummaries.pwc.com"  # Replace with the path to your input HTML folder
    output_folder = "taxsummaries.markdown" # Replace with the desired path for output Markdown folder

    if not os.path.exists(input_folder):
        print(f"Error: Input folder '{input_folder}' does not exist.")
        return

    convert_html_folder_to_markdown(input_folder, output_folder)
    print("\nHTML to Markdown conversion completed.")

if __name__ == "__main__":
    main()