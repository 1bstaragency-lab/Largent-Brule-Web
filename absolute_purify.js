const { execSync } = require('child_process');

const script = `
from PIL import Image, ImageChops

def purify(input_path, output_path, crop_box=None):
    img = Image.open(input_path).convert("RGBA")
    if crop_box:
        img = img.crop(crop_box)
    
    # Find bounding box of non-white pixels
    # We assume background is roughly white (255, 255, 255)
    # Convert to grayscale and invert to find non-white areas
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    
    if bbox:
        clothing = img.crop(bbox)
        # Create final 1024x1024 white canvas
        final = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
        # Scale clothing to fit nicely (e.g. 800px max dimension)
        w, h = clothing.size
        scale = min(800 / w, 800 / h)
        new_size = (int(w * scale), int(h * scale))
        clothing = clothing.resize(new_size, Image.Resampling.LANCZOS)
        
        # Center it
        x = (1024 - clothing.width) // 2
        y = (1024 - clothing.height) // 2
        final.paste(clothing, (x, y), clothing)
        final.save(output_path)
        return True
    return False

# Purify Raglan
purify("public/raglan_tee.png", "public/raglan_tee_final.png")

# Purify Hoodie Front (Left half)
purify("public/hoodie_full.png", "public/hoodie_front_final.png", (0, 0, 512, 1024))

# Purify Hoodie Back (Right half)
purify("public/hoodie_full.png", "public/hoodie_back_final.png", (512, 0, 1024, 1024))
`;

try {
    execSync(\`python3 -c "\${script}"\`);
    console.log('Absolute Clinical Purification Successful');
} catch (e) {
    console.log('Purification failed:', e.message);
}
