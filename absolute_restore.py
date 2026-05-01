from PIL import Image, ImageChops, ImageDraw

def purify(input_path, output_path, crop_box=None, remove_text=False):
    try:
        img = Image.open(input_path).convert("RGBA")
        if crop_box:
            img = img.crop(crop_box)
        
        # Thresholding for background removal
        gray = img.convert("L")
        mask = gray.point(lambda p: 255 if p < 252 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            
            # DIGITAL RECONSTRUCTION: Remove text if back
            if remove_text:
                # We know the text is roughly in the center of the yellow body.
                # We'll fill the center area with the average color of the surrounding pixels.
                # For the Raglan, the body is yellow.
                draw = ImageDraw.Draw(clothing)
                # Area where "L'ARGENT BRULE" text is. 
                # This is a heuristic, but we'll try to be precise.
                w, h = clothing.size
                # Fill a box in the middle-top area
                draw.rectangle([w*0.2, h*0.2, w*0.8, h*0.6], fill=(253, 236, 154, 255)) # Approximate yellow
            
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            w, h = clothing.size
            scale = min(850 / w, 850 / h)
            new_size = (int(w * scale), int(h * scale))
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing.width) // 2
            y = (1024 - clothing.height) // 2
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Restored: {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# 1. Raglan Restoration
purify("public/raglan_tee.png", "public/raglan_front_v3.png")
purify("public/raglan_tee.png", "public/raglan_back_v3.png", remove_text=True)

# 2. Hoodie Restoration
purify("public/hoodie_full.png", "public/hoodie_front_v3.png", (0, 0, 512, 1024))
purify("public/hoodie_full.png", "public/hoodie_back_v3.png", (512, 0, 1024, 1024))
