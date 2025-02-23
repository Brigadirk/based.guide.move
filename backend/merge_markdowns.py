import os

def merge_markdown_files(input_subfolder, output_folder, output_filename):
    """
    Merges all Markdown files within a single input subfolder into one output Markdown file.

    Args:
        input_subfolder (str): Path to the input subfolder containing Markdown files.
        output_folder (str): Path to the output folder where merged file will be saved.
        output_filename (str): Name for the merged output Markdown file.
    """
    merged_content = []
    for root, _, files in os.walk(input_subfolder):
        for file in files:
            if file.lower().endswith('.md'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as md_file:
                        content = md_file.read()
                        merged_content.append(content)
                except Exception as e:
                    print(f"Error reading file: {filepath} - {e}")

    if merged_content:
        output_filepath = os.path.join(output_folder, output_filename + ".md")
        try:
            with open(output_filepath, 'w', encoding='utf-8') as outfile:
                outfile.write("\n\n".join(merged_content).strip()) # Join with double newlines, strip whitespace
            print(f"Merged Markdown files from '{input_subfolder}' into '{output_filepath}'")
        except Exception as e:
            print(f"Error writing merged file: {output_filepath} - {e}")
    else:
        print(f"No Markdown files found in '{input_subfolder}' to merge.")


def merge_markdown_from_folders(input_folder, output_folder):
    """
    Loops through all subfolders in the input folder and merges Markdown files within each
    into a single Markdown file in the output folder.

    Args:
        input_folder (str): Path to the main input folder containing subfolders.
        output_folder (str): Path to the output folder where merged files will be saved.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    subfolders = [d for d in os.listdir(input_folder) if os.path.isdir(os.path.join(input_folder, d))]

    if not subfolders:
        print(f"No subfolders found in the input folder: '{input_folder}'")
        return

    for subfolder_name in subfolders:
        input_subfolder_path = os.path.join(input_folder, subfolder_name)
        output_filename = subfolder_name  # Use subfolder name as output filename
        merge_markdown_files(input_subfolder_path, output_folder, output_filename)


def main():
    input_folder = "tax_markdown_folder_markdown_aggressive_expanded"  # Replace with your input folder path
    output_folder = "merged_markdown_folder"  # Replace with your desired output folder path

    if not os.path.exists(input_folder):
        print(f"Error: Input folder '{input_folder}' does not exist.")
        return

    merge_markdown_from_folders(input_folder, output_folder)
    print("\nMarkdown file merging completed.")


if __name__ == "__main__":
    main()