from PIL import Image

def create_white_variation(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        pixels = img.load()
        w, h = img.size
        
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                
                # Skip fully transparent pixels (background)
                if a < 10:
                    continue
                
                # Target yellow/cream body pixels:
                # Yellow: high R, high G, lower B
                # Leave navy (low R, low G, low B) and pure white background alone
                is_yellow = r > 180 and g > 160 and b < 170
                is_cream = r > 220 and g > 205 and b > 170 and b < 235
                
                if is_yellow or is_cream:
                    pixels[x, y] = (255, 255, 255, a)
        
        img.save(output_path)
        print(f"White variation created: {output_path}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

create_white_variation("public/raglan_front_v4.png", "public/raglan_front_white_v1.png")
