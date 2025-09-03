const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const svgBuffer = fs.readFileSync('../assets/icon.svg');

  const sizes = [16, 32, 48, 128];

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`../assets/icon-${size}.png`);
    console.log(`Generated ../assets/icon-${size}.png`);
  }
}

generateIcons().catch(console.error);