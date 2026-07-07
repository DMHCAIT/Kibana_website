const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'kibana_product_images', '1 collection', 'laptop bag', 'Milky Blue', '6.jpeg');
const outputPath = path.join(__dirname, 'public', 'kibana_product_images', '1 collection', 'laptop bag', 'Milky Blue', '6.webp');

sharp(inputPath)
  .webp({ quality: 80 })
  .toFile(outputPath)
  .then(info => {
    console.log('✅ Image converted successfully!');
    console.log(`Input: ${inputPath}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Size: ${info.width}x${info.height}, ${info.size} bytes`);
  })
  .catch(err => {
    console.error('❌ Error converting image:', err);
    process.exit(1);
  });
