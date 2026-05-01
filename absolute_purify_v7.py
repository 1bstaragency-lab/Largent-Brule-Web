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
            
            # ACCELERATED VERTICAL PRESENCE: Scale to fill 920px HEIGHT regardless of width
            # (As long as it doesn't exceed 1024px width too much)
            target_h = 920
            scale = target_h / h
            new_size = (int(w * scale), int(h * scale))
            
            # Ensure width doesn't exceed 1020px
            if new_size[0] > 1020:
                scale = 1020 / w
                new_size = (int(w * scale), int(h * scale))
                
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing.width) // 2
            # VERTICAL CENTERING: Align more towards the bottom to match the Raglan's poise
            y = (1024 - clothing.height) // 2 + 20
            
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Purified V7: {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# Purify Hoodie with accelerated vertical presence
purify("public/hoodie_full.png", "public/hoodie_front_v7.png", (0, 0, 512, 1024))
purify("public/hoodie_full.png", "public/hoodie_back_v7.png", (512, 0, 1024, 1024))
