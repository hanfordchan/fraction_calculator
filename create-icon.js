const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a 1024x1024 blue background
const size = 1024;
const backgroundColor = '#007AFF';

// Create SVG string for the icon
const svgString = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="180" ry="180"/>

  <!-- Fraction display -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Numerator x -->
    <text x="0" y="-80" text-anchor="middle" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" font-style="italic">x</text>

    <!-- Fraction bar -->
    <rect x="-200" y="-40" width="400" height="20" fill="#FFFFFF" rx="10"/>

    <!-- Denominator y -->
    <text x="0" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" font-style="italic">y</text>
  </g>
</svg>
`;

// Create a buffer from SVG
const svgBuffer = Buffer.from(svgString);

// Convert to PNG
sharp(svgBuffer)
  .png()
  .toFile('icon.png')
  .then(() => {
    console.log('✓ Created icon.png (1024x1024)');

    // Generate iOS icons
    const iosSizes = [180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];
    iosSizes.forEach(size => {
      sharp(svgBuffer)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png()
        .toFile(`ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/App-Icon-${size}x${size}@1x.png`)
        .catch(() => {}); // Ignore errors
    });

    // Generate Android icons
    const androidSizes = [
      { size: 192, name: 'xxxhdpi' },
      { size: 144, name: 'xxhdpi' },
      { size: 96, name: 'xhdpi' },
      { size: 72, name: 'hdpi' },
      { size: 48, name: 'mdpi' },
    ];

    androidSizes.forEach(({ size, name }) => {
      sharp(svgBuffer)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png()
        .toFile(`android/app/src/main/res/mipmap-${name}/ic_launcher.png`)
        .then(() => console.log(`✓ Created Android icon: ${name} (${size}x${size})`))
        .catch(() => {});
    });

    // Round Android icons
    androidSizes.forEach(({ size, name }) => {
      sharp(svgBuffer)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png()
        .toFile(`android/app/src/main/res/mipmap-${name}/ic_launcher_round.png`)
        .catch(() => {});
    });

    console.log('✓ Icon generation complete!');
  })
  .catch(err => {
    console.error('Error creating icon:', err);
  });
