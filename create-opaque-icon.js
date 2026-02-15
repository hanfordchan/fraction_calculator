const sharp = require('sharp');

const size = 1024;
const backgroundColor = '#007AFF';

// Create SVG as a simple rectangle with no rounded corners
const svgString = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
  <g transform="translate(${size/2}, ${size/2})">
    <text x="0" y="-80" text-anchor="middle" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" font-style="italic">x</text>
    <rect x="-200" y="-40" width="400" height="20" fill="#FFFFFF" rx="10"/>
    <text x="0" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" font-style="italic">y</text>
  </g>
</svg>
`;

async function createOpaqueIcons() {
  const svgBuffer = Buffer.from(svgString);

  // Create main icon - completely opaque
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3, // RGB only, no alpha channel
      background: {
        r: 0,
        g: 122,
        b: 255
      }
    }
  })
  .png()
  .toFile('icon.png');

  console.log('✓ Created icon.png (1024x1024) - Opaque RGB');

  // iOS icon sizes
  const iosSizes = [180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];

  for (const size of iosSizes) {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: {
          r: 0,
          g: 122,
          b: 255
        }
      }
    })
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(`ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/App-Icon-${size}x${size}@1x.png`);
  }

  console.log('✓ Created all iOS icons (Opaque RGB - no alpha channel)');
}

createOpaqueIcons().catch(err => {
  console.error('Error:', err);
});
