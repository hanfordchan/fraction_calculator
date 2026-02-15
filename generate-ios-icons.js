const sharp = require('sharp');
const fs = require('fs');

// iOS required icon sizes
const iosSizes = [
  { size: 1024, filename: 'App-Icon-1024x1024@1x.png' },
  { size: 180, filename: 'App-Icon-180x180@1x.png' }, // iPhone
  { size: 167, filename: 'App-Icon-167x167@1x.png' }, // iPad Pro
  { size: 152, filename: 'App-Icon-152x152@1x.png' }, // iPad
  { size: 120, filename: 'App-Icon-120x120@1x.png' }, // iPhone
  { size: 87, filename: 'App-Icon-87x87@1x.png' },    // iPhone
  { size: 80, filename: 'App-Icon-80x80@1x.png' },    // iPhone
  { size: 76, filename: 'App-Icon-76x76@1x.png' },    // iPad
  { size: 60, filename: 'App-Icon-60x60@1x.png' },    // iPhone
  { size: 58, filename: 'App-Icon-58x58@1x.png' },    // iPhone
  { size: 40, filename: 'App-Icon-40x40@1x.png' },    // iPhone
  { size: 29, filename: 'App-Icon-29x29@1x.png' },    // iPhone
  { size: 20, filename: 'App-Icon-20x20@1x.png' },    // iPhone
];

// Create SVG string for the icon
const size = 1024;
const backgroundColor = '#007AFF';

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

// Generate all iOS icons
Promise.all(iosSizes.map(async ({ size, filename }) => {
  const targetDir = 'ios/FractionCalculator/Images.xcassets/AppIcon.appiconset';
  const outputPath = `${targetDir}/${filename}`;

  await sharp(svgBuffer)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${filename} (${size}x${size})`);
})).then(() => {
  console.log('\n✓ All iOS icons generated!');

  // Update Contents.json
  const contentsJson = {
    images: iosSizes.map(({ filename, size }) => ({
      filename: filename,
      idiom: 'universal',
      platform: 'ios',
      size: `${size}x${size}`
    })),
    info: {
      version: 1,
      author: 'expo'
    }
  };

  fs.writeFileSync(
    'ios/FractionCalculator/Images.xcassets/AppIcon.appiconset/Contents.json',
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('✓ Updated Contents.json');
}).catch(err => {
  console.error('Error:', err);
});
