const sharp = require('sharp');

// iOS icon sizes
const iosSizes = [1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];

async function createSimpleOpaqueIcons() {
  for (const size of iosSizes) {
    // Create a solid blue square - no text, nothing that could cause transparency
    const svgString = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#007AFF"/>
</svg>`;

    const svgBuffer = Buffer.from(svgString);

    // Create PNG - sharp's png() doesn't support channels option, so we use create with explicit 3 channels
    const metadata = { width: size, height: size };
    const image = sharp({
      create: {
        width: size,
        height: size,
        channels: 3, // RGB only, no alpha
        background: { r: 0, g: 122, b: 255 }
      }
    });

    const pngBuffer = await image.png().toBuffer();

    await sharp(pngBuffer)
      .toFile(`ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/App-Icon-${size}x${size}@1x.png`);
  }

  console.log('✓ Created simple solid blue icons (100% opaque)');
}

createSimpleOpaqueIcons().catch(err => {
  console.error('Error:', err);
});
