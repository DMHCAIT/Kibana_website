import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const faviconPath = path.join(process.cwd(), 'public', 'favicon-16x16.png');
const tempPath = path.join(process.cwd(), 'public', 'favicon-16x16-temp.png');
const radius = 4; // Border radius in pixels for 16x16 image

// Create a rounded rectangle SVG mask
const svg = `
  <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" rx="${radius}" ry="${radius}" fill="white"/>
  </svg>
`;

// Read the original image, apply rounded corners, and save to temp file
sharp(faviconPath)
  .composite([
    {
      input: Buffer.from(svg),
      blend: 'dest-in'
    }
  ])
  .toFile(tempPath)
  .then(() => {
    // Replace original with the modified version
    fs.renameSync(tempPath, faviconPath);
    console.log(`✓ Added border radius to ${faviconPath}`);
  })
  .catch((err) => {
    console.error('Error processing favicon:', err);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    process.exit(1);
  });
