const { execSync } = require('child_process');

try {
    // 1. Fix Raglan: Original is 1024x764. Pad to 1024x1024 with pure white.
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/raglan_tee.png\').convert(\'RGBA\'); new_img = Image.new(\'RGBA\', (1024, 1024), (255, 255, 255, 255)); new_img.paste(img, (0, (1024 - img.height) // 2)); new_img.save(\'public/raglan_tee_final.png\')"');
    
    // 2. Fix Hoodie Front: Crop left 50% (0, 0, 512, 1024), then pad to 1024x1024.
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/hoodie_full.png\').convert(\'RGBA\'); front = img.crop((0, 0, 512, 1024)); new_img = Image.new(\'RGBA\', (1024, 1024), (255, 255, 255, 255)); new_img.paste(front, ((1024 - front.width) // 2, 0)); new_img.save(\'public/hoodie_front_final.png\')"');
    
    // 3. Fix Hoodie Back: Crop right 50% (512, 0, 1024, 1024), then pad to 1024x1024.
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/hoodie_full.png\').convert(\'RGBA\'); back = img.crop((512, 0, 1024, 1024)); new_img = Image.new(\'RGBA\', (1024, 1024), (255, 255, 255, 255)); new_img.paste(back, ((1024 - back.width) // 2, 0)); new_img.save(\'public/hoodie_back_final.png\')"');
    
    console.log('Technical asset purification successful');
} catch (e) {
    console.log('Purification failed:', e.message);
}
