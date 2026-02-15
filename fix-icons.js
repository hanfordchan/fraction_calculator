const sharp = require('sharp');

const size = 1024;
const backgroundColor = '#007AFF';

// Create SVG with no transparency
const svgString = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="180" ry="180"/>
  <g transform="translate(${size/2}, ${size/2})">
    <text x="0" y="-80" text-anchor="middle" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" font-style="italic">x</text>
    <rect x="-200" y="-40" width="400" height="20" fill="#FFFFFF" rx="10"/>
    <text x="0" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" font-style="italic">y</text>
  </g>
</svg>
`;

const svgBuffer = Buffer.from(svgString);

// Create PNG with no alpha channel (opaque)
sharp(svgBuffer)
  .png()
  .toFile('icon.png')
  .then(() => {
    console.log('✓ Created icon.png (1024x1024) - Opaque');

    // iOS icon sizes
    const iosSizes = [180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];

    Promise.all(iosSizes.map(size => {
      return sharp(svgBuffer)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .flatten({ background: { r: 0, g: 122, b: 255 } })  // Ensure opaque background
        .png()
        .toFile(`ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/App-Icon-${size}x${size}@1x.png`);
    })).then(() => {
      console.log('✓ Created all iOS icons (Opaque)');
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });
