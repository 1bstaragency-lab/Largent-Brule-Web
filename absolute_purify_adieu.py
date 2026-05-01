from PIL import Image, ImageChops, ImageFilter

def purify(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # We need to remove the concrete floor background.
        # The shirt is roughly cream/white.
        # Convert to HSV to isolate color if needed, but let's try a simple threshold first.
        # Actually, let's use the Alpha channel if available (unlikely for JPG).
        
        # Convert to grayscale
        gray = img.convert("L")
        # The floor is likely darker or more textured than the shirt.
        # We'll use a threshold to find the shirt. 
        # Since the shirt is bright, let's try everything > 180.
        mask = gray.point(lambda p: 255 if p > 160 else 0)
        
        # Clean up mask (denoise)
        mask = mask.filter(ImageFilter.MedianFilter(size=5))
        
        bbox = mask.getbbox()
        
        if bbox:
            clothing = img.crop(bbox)
            
            # Create final 1024x1024 white canvas
            final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
            w, h = clothing.size
            # SCALE: 900px
            scale = min(900 / w, 900 / h)
            new_size = (int(w * scale), int(h * scale))
            clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
            
            x = (1024 - clothing.width) // 2
            y = (1024 - clothing.height) // 2 + 20
            
            final.paste(clothing, (x, y), clothing)
            final.save(output_path)
            print(f"Purified ADIEU: {output_path}")
            return True
    except Exception as e:
        print(f"Error: {e}")
    return False

purify("/Users/josephbarnes/.gemini/antigravity/brain/6ca699b2-14a4-4bb3-a820-568ef23a5784/media__1777600804390.jpg", "public/adieu_tee_clean.png")
