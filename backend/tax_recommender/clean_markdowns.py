import os
import shutil

# Path to the markdown_files folder
base_folder = "markdown"

# Folders to remove
folders_to_remove = ["archives", "compare-territories", "interactive map"]

# Remove specified folders
for folder in folders_to_remove:
    folder_path = os.path.join(base_folder, folder)
    if os.path.exists(folder_path):
        print(f"Removing folder: {folder_path}")
        shutil.rmtree(folder_path)
    else:
        print(f"Folder does not exist: {folder_path}")

# Function to combine markdown files in a folder and move the combined file one level up
def combine_and_move_markdown(folder_name):
    for root, dirs, files in os.walk(base_folder):
        # Check if the current directory is the target folder (corporate or individual)
        if os.path.basename(root) == folder_name:
            # Path to the combined markdown file
            combined_file_path = os.path.join(os.path.dirname(root), f"{folder_name}.md")

            # Combine all markdown files in the folder
            with open(combined_file_path, "w", encoding="utf-8") as combined_file:
                for file in files:
                    if file.endswith(".md"):
                        file_path = os.path.join(root, file)
                        with open(file_path, "r", encoding="utf-8") as md_file:
                            combined_file.write(md_file.read())
                            combined_file.write("\n\n")  # Add spacing between files
                        print(f"Added content from: {file_path}")

            # Remove the original folder
            print(f"Removing folder: {root}")
            shutil.rmtree(root)

# Process corporate and individual folders
combine_and_move_markdown("corporate")
combine_and_move_markdown("individual")

print("Cleanup and combination complete!")