import os
import rembg
from PIL import Image

def remove_background(input_path, output_path):
    print(f"Loading image from {input_path}...")
    try:
        input_image = Image.open(input_path)
        print("Image loaded successfully. Removing background...")
        # remove background
        output_image = rembg.remove(input_image)
        # save as png
        output_image.save(output_path)
        print(f"Background removed successfully. Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = r"c:\Users\muzyc\.gemini\antigravity\playground\ancient-lagoon\opvs-landing\assets\opvs_hero_agent.png"
    output_file = r"c:\Users\muzyc\.gemini\antigravity\playground\ancient-lagoon\opvs-landing\assets\opvs_hero_agent_nobg.png"
    
    if os.path.exists(input_file):
        remove_background(input_file, output_file)
    else:
        print(f"Input file not found: {input_file}")
