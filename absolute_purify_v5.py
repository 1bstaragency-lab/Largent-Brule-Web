from PIL import Image, ImageChops

def purify(input_path, output_path, crop_box=None):
    try:
        img = Image.open(input_path).convert("RGBA")
        if crop_box:
            img = img.crop(crop_box)
        
        gray = img.convert("L")
        mask = gray.point(lambda p: 255 if p < 248 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            w, h = clothing.size
            # MONUMENTAL SCALE: Use 1000 for maximum footprint
            scale = min(1000 / w, 1000 / h)
            new_size = (int(w * scale), int(h * scale))
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing.width) // 2
            y = (1024 - clothing.height) // 2
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Purified: {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# Purify Hoodie Front with MONUMENTAL scale
purify("public/hoodie_full.png", "public/hoodie_front_v5.png", (0, 0, 512, 1024))
# Back too, just in case they hover
purify("public/hoodie_full.png", "public/hoodie_back_v5.png", (512, 0, 1024, 1024))
