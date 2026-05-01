from PIL import Image, ImageChops, ImageFilter

def purify(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # This one is a PNG, likely with a clean or textured background.
        gray = img.convert("L")
        # Try a threshold for the shirt (assuming it's bright)
        mask = gray.point(lambda p: 255 if p > 160 else 0)
        mask = mask.filter(ImageFilter.MedianFilter(size=5))
        
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            w, h = clothing.size
            scale = min(920 / w, 920 / h)
            new_size = (int(w * scale), int(h * scale))
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing.width) // 2
            y = (1024 - clothing.height) // 2 + 20
            
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Purified ADIEU (Attempt 2): {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# Attempting with media__1777599037466.png
purify("/Users/josephbarnes/.gemini/antigravity/brain/6ca699b2-14a4-4bb3-a820-568ef23a5784/media__1777599037466.png", "public/adieu_tee_clean.png")
