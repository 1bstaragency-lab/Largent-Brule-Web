from PIL import Image, ImageChops

def purify(input_path, output_path, crop_box=None):
    try:
        img = Image.open(input_path).convert("RGBA")
        if crop_box:
            img = img.crop(crop_box)
        
        gray = img.convert("L")
        mask = gray.point(lambda p: 255 if p < 252 else 0)
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            w, h = clothing.size
            scale = min(850 / w, 850 / h)
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

purify("public/raglan_tee.png", "public/raglan_tee_v2.png")
purify("public/hoodie_full.png", "public/hoodie_front_v2.png", (0, 0, 512, 1024))
purify("public/hoodie_full.png", "public/hoodie_back_v2.png", (512, 0, 1024, 1024))
