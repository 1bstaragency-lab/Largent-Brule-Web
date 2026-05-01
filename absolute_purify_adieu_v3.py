from PIL import Image, ImageChops, ImageFilter, ImageOps

def purify(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # authoritative cleanup: Screenshot 2026-04-30 at 10.03.58 PM
        # The background is a concrete floor.
        # The shirt is the main central object.
        
        # Convert to HSV to better isolate the shirt
        hsv = img.convert("HSV")
        h, s, v = hsv.split()
        
        # The shirt is likely brighter (V) and less saturated (S) than the concrete?
        # Or maybe the concrete is just darker.
        # Let's use a combination mask.
        mask_v = v.point(lambda p: 255 if p > 160 else 0)
        # Concrete floor usually has some saturation/noise, but let's keep it simple.
        
        # Denoise the mask
        mask = mask_v.filter(ImageFilter.MedianFilter(size=7))
        
        # Find the main clothing object
        bbox = mask.getbbox()
        if bbox:
            clothing = img.crop(bbox)
            
            # Create a white background for the clothing itself
            # We'll use the mask on the cropped clothing to remove the remaining floor bits
            crop_mask = mask.crop(bbox)
            
            final_clothing = Image.new("RGBA", clothing.size, (255, 255, 255, 255))
            final_clothing.paste(clothing, (0, 0), crop_mask)
            
            # Now create the clinical 1024x1024 canvas
            canvas = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            cw, ch = final_clothing.size
            scale = min(920 / cw, 920 / ch)
            new_size = (int(cw * scale), int(ch * scale))
            final_clothing = final_clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - final_clothing.width) // 2
            y = (1024 - final_clothing.height) // 2 + 20
            
            canvas.paste(final_clothing, (x, y), final_clothing)
            canvas.save(output_path)
            print(f"Purified ADIEU (Authoritative): {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

# Using media__1777601045645.jpg (10.04 PM)
purify("/Users/josephbarnes/.gemini/antigravity/brain/6ca699b2-14a4-4bb3-a820-568ef23a5784/media__1777601045645.jpg", "public/adieu_tee_clean.png")
