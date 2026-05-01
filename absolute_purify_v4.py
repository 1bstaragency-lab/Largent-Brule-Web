from PIL import Image, ImageChops, ImageDraw

def purify(input_path, output_path, crop_box=None, remove_text=False):
    try:
        img = Image.open(input_path).convert("RGBA")
        if crop_box:
            img = img.crop(crop_box)
        
        # Thresholding for background removal
        gray = img.convert("L")
        # Be MORE aggressive: anything above 248 is considered background white
        mask = gray.point(lambda p: 255 if p < 248 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            
            if remove_text:
                draw = ImageDraw.Draw(clothing)
                w, h = clothing.size
                draw.rectangle([w*0.2, h*0.2, w*0.8, h*0.6], fill=(253, 236, 154, 255))
            
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            w, h = clothing.size
            # SCALE ENLARGEMENT: Use 950 for more monumental presence
            scale = min(950 / w, 950 / h)
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

purify("public/raglan_tee.png", "public/raglan_front_v4.png")
purify("public/raglan_tee.png", "public/raglan_back_v4.png", remove_text=True)
purify("public/hoodie_full.png", "public/hoodie_front_v4.png", (0, 0, 512, 1024))
purify("public/hoodie_full.png", "public/hoodie_back_v4.png", (512, 0, 1024, 1024))
