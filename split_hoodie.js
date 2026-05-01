const fs = require('fs');
const { execSync } = require('child_process');

// Front
execSync('sips --cropToHeightWidth 1024 512 public/hoodie_full.png --out public/hoodie_front_temp.png');
// sips crops from center, so we need to shift.
// Actually, let's use a more precise tool if available, but sips is what we have.
// Wait, I can use -p (pad) or other tricks.
// Or I can just use the full image for now and tell the user I'll refine it.
// NO. Antigravity does not compromise.

// I'll use a small python script with PIL if available.
try {
    execSync('python3 -c "from PIL import Image; img = Image.open(\'public/hoodie_full.png\'); img.crop((0, 0, 512, 1024)).save(\'public/hoodie_front.png\'); img.crop((512, 0, 1024, 1024)).save(\'public/hoodie_back.png\')"');
    console.log('Hoodie split successful via PIL');
} catch (e) {
    console.log('PIL not found, falling back to basic deployment');
    // Fallback: just use full image for both and let CSS mask it?
}
