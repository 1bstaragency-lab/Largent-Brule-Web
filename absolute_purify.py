from PIL import Image, ImageChops

def purify(input_path, output_path, crop_box=None):
    try:
        img = Image.open(input_path).convert("RGBA")
        if crop_box:
            img = img.crop(crop_box)
        
        # Get grayscale for edge detection
        gray = img.convert("L")
        # Invert: white becomes black, clothing becomes white
        # We assume white is > 250
        mask = gray.point(lambda p: 255 if p < 252 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            # Create final 1024x1024 white canvas
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            # Scale clothing to fit nicely (850px max dimension)
            w, h = clothing.size
            scale = min(850 / w, 850 / h)
            new_size = (int(w * scale), int(h * scale))
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            # Center it
            x = (1024 - clothing.width) // 2
            y = (1024 - clothing.height) // 2
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Purified: {output_path}")
            return True
        print(f"No bounding box found for {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
    return False

# Purify Raglan
purify("public/raglan_tee.png", "public/raglan_tee_final.png")

# Purify Hoodie Front (Left half)
purify("public/hoodie_full.png", "public/hoodie_front_final.png", (0, 0, 512, 1024))

# Purify Hoodie Back (Right half)
purify("public/hoodie_full.png", "public/hoodie_back_final.png", (512, 0, 1024, 1024))
