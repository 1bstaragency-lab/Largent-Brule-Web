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
            
            # MACRO SCALE: 1300px height (will overflow width/height slightly)
            # This achieves the "2x larger" feel by filling the entire container and bleeding
            target_h = 1300
            scale = target_h / h
            new_size = (int(w * scale), int(h * scale))
            
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing.width) // 2
            y = (1024 - clothing.height) // 2 + 50
            
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Purified V8: {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# Purify Hoodie with MACRO scale
purify("public/hoodie_full.png", "public/hoodie_front_v8.png", (0, 0, 512, 1024))
purify("public/hoodie_full.png", "public/hoodie_back_v8.png", (512, 0, 1024, 1024))
