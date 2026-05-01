const { execSync } = require('child_process');

try {
    // Pad Raglan to 1024x1024 with white background
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/raglan_tee.png\').convert(\'RGBA\'); new_img = Image.new(\'RGBA\', (1024, 1024), (255, 255, 255, 255)); new_img.paste(img, (0, (1024 - img.height) // 2)); new_img.save(\'public/raglan_tee_padded.png\')"');
    
    // Pad Hoodie Front/Back to 1024x1024 with white background
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/hoodie_front.png\').convert(\'RGBA\'); new_img = Image.new(\'RGBA\', (1024, 1024), (255, 255, 255, 255)); new_img.paste(img, ((1024 - img.width) // 2, 0)); new_img.save(\'public/hoodie_front_padded.png\')"');
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/hoodie_back.png\').convert(\'RGBA\'); new_img = Image.new(\'RGBA\', (1024, 1024), (255, 255, 255, 255)); new_img.paste(img, ((1024 - img.width) // 2, 0)); new_img.save(\'public/hoodie_back_padded.png\')"');
    
    console.log('Collection scaling recalibration successful');
} catch (e) {
    console.log('Scaling calibration failed:', e.message);
}
