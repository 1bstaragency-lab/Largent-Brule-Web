from PIL import Image, ImageChops, ImageFilter

def purify(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # authoritative cleanup: Screenshot 2026-04-30 at 10.03.58 PM
        # Using HSV to surgically isolate the off-white shirt from the concrete.
        hsv = img.convert("HSV")
        h, s, v = hsv.split()
        
        # Shirt isolation: Brightness (V) > 160
        mask = v.point(lambda p: 255 if p > 160 else 0)
        mask = mask.filter(ImageFilter.MedianFilter(size=7))
        
        bbox = mask.getbbox()
        if bbox:
            clothing = img.crop(bbox)
            crop_mask = mask.crop(bbox)
            
            # TRUE CLINICAL TRANSPARENCY: Create a 1024x1024 canvas with 0 alpha
            canvas = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))
            
            # Prepare clothing with its mask
            clothing_with_alpha = Image.new("RGBA", clothing.size, (0, 0, 0, 0))
            clothing_with_alpha.paste(clothing, (0, 0), crop_mask)
            
            cw, ch = clothing_with_alpha.size
            scale = min(920 / cw, 920 / ch)
            new_size = (int(cw * scale), int(ch * scale))
            clothing_with_alpha = clothing_with_alpha.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing_with_alpha.width) // 2
            y = (1024 - clothing_with_alpha.height) // 2 + 20
            
            canvas.paste(clothing_with_alpha, (x, y), clothing_with_alpha)
            canvas.save(output_path)
            print(f"Purified ADIEU (True Transparency): {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# Re-running with True Transparency
purify("/Users/josephbarnes/.gemini/antigravity/brain/6ca699b2-14a4-4bb3-a820-568ef23a5784/media__1777601045645.jpg", "public/adieu_tee_clean.png")
