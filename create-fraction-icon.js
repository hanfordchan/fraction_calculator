const sharp = require('sharp');

// iOS icon sizes
const iosSizes = [1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];

async function createFractionIcons() {
  for (const size of iosSizes) {
    // Calculate dimensions based on size
    const contentSize = Math.floor(size * 0.7);
    const contentTop = Math.floor((size - contentSize) / 2);
    const fontSize = Math.floor(contentSize * 0.35);
    const barHeight = Math.max(2, Math.floor(contentSize * 0.03));
    const barWidth = Math.floor(contentSize * 0.6);

    // Create SVG with the fraction design
    const svgString = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid blue background -->
  <rect width="${size}" height="${size}" fill="#007AFF"/>

  <!-- Fraction x/y design -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Numerator x -->
    <text x="0" y="${-barHeight - fontSize/2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" font-style="italic">x</text>

    <!-- Fraction bar -->
    <rect x="${-barWidth/2}" y="${-barHeight/2}" width="${barWidth}" height="${barHeight}" fill="#FFFFFF"/>

    <!-- Denominator y -->
    <text x="0" y="${fontSize + barHeight/2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" font-style="italic">y</text>
  </g>
</svg>
`;

    const svgBuffer = Buffer.from(svgString);

    // Convert SVG to PNG without alpha channel for 100% opacity
    await sharp(svgBuffer)
      .resize(size, size)
      .png({
        compressionLevel: 9,
        adaptiveFiltering: false,
        effort: 1,
        quality: 100
      })
      .toFile(`ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/App-Icon-${size}x${size}@1x.png`);
  }

  console.log('✓ Created x/y fraction icons on solid blue background (100% opaque)');
}

createFractionIcons().catch(err => {
  console.error('Error:', err);
});
