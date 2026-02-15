const sharp = require('sharp');

// iOS icon sizes
const iosSizes = [1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];

async function createOpaqueIcons() {
  for (const size of iosSizes) {
    // Create each icon at its exact size - no resizing
    const svgString = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#007AFF"/>
  <g transform="translate(${size/2}, ${size/2})">
    <text x="0" y="${size * 0.08}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.27}" font-weight="bold" fill="#FFFFFF" font-style="italic">x</text>
    <rect x="${size * -0.2}" y="${size * -0.04}" width="${size * 0.4}" height="${size * 0.02}" fill="#FFFFFF"/>
    <text x="0" y="${size * 0.24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.27}" font-weight="bold" fill="#FFFFFF" font-style="italic">y</text>
  </g>
</svg>
`;

    const svgBuffer = Buffer.from(svgString);

    // Convert to PNG without alpha channel
    await sharp(svgBuffer)
      .resize(size, size)
      .png({
        compressionLevel: 9,
        adaptiveFiltering: false,
        effort: 1, // Less filtering to avoid artifacts
        quality: 100
      })
      .toFile(`ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/App-Icon-${size}x${size}@1x.png`);
  }

  console.log('✓ Created all iOS icons (exact sizes, no transparency)');
}

createOpaqueIcons().catch(err => {
  console.error('Error:', err);
});
