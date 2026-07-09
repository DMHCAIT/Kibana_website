import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://opkgstmsfyjzbympczwd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa2dzdG1zZnlqemJ5bXBjendkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4NDgyNjAsImV4cCI6MjAzNTQyNDI2MH0.8fpjVz7wjPFDm-t7AaGC0dFvpBMzGq7K6rLoA4fJ3fI';

function getAllFiles(dir, prefix = '') {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, prefix ? prefix + '/' + item : item));
    } else {
      files.push({
        fullPath,
        relativePath: prefix ? prefix + '/' + item : item
      });
    }
  });
  
  return files;
}

async function uploadFileToSupabase(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  
  const url = `${SUPABASE_URL}/storage/v1/object/kibana_product_images/${fileName}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: error.substring(0, 100) };
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function uploadAllFiles() {
  const localDir = path.join(__dirname, '../public/kibana_product_images');
  const files = getAllFiles(localDir);
  
  console.log(`Found ${files.length} files to upload\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const uploadedFiles = [];
  
  // Upload sequentially with delays to avoid rate limiting
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = `kibana_product_images/${file.relativePath}`;
    
    const result = await uploadFileToSupabase(file.fullPath, fileName);
    
    if (result.success) {
      successCount++;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
      uploadedFiles.push({
        originalPath: `/${file.relativePath}`,
        publicUrl: publicUrl
      });
    } else {
      errorCount++;
      if (errorCount <= 5) {
        console.log(`❌ ${file.relativePath}: ${result.error}`);
      }
    }
    
    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${files.length} (${successCount} success, ${errorCount} errors)`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  console.log(`\n✅ Upload complete!`);
  console.log(`Success: ${successCount}, Errors: ${errorCount}`);
  
  return uploadedFiles;
}

async function updateProductsJson(uploadedFiles) {
  const productsPath = path.join(__dirname, '../src/data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  
  // Create map from original paths to Supabase URLs
  const fileMap = {};
  uploadedFiles.forEach(file => {
    fileMap[file.originalPath] = file.publicUrl;
  });
  
  console.log(`\nMapping ${uploadedFiles.length} files to products.json...`);
  
  let updatedCount = 0;
  
  // Update each product
  const updatedProducts = products.map(product => {
    const updated = { ...product };
    
    // Update main image
    if (updated.image && fileMap[updated.image]) {
      updated.image = fileMap[updated.image];
      updatedCount++;
    }
    
    // Update gallery
    if (updated.gallery && Array.isArray(updated.gallery)) {
      updated.gallery = updated.gallery.map(url => fileMap[url] || url);
    }
    
    // Update video
    if (updated.video && fileMap[updated.video]) {
      updated.video = fileMap[updated.video];
      updatedCount++;
    }
    
    // Update color variants
    if (updated.colorVariants && Array.isArray(updated.colorVariants)) {
      updated.colorVariants = updated.colorVariants.map(cv => {
        if (cv.image && fileMap[cv.image]) {
          cv.image = fileMap[cv.image];
        }
        if (cv.gallery && Array.isArray(cv.gallery)) {
          cv.gallery = cv.gallery.map(url => fileMap[url] || url);
        }
        return cv;
      });
    }
    
    return updated;
  });
  
  fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
  console.log(`✅ Updated ${updatedCount} image URLs in products.json`);
}

// Main
(async () => {
  try {
    const uploadedFiles = await uploadAllFiles();
    
    if (uploadedFiles.length > 0) {
      await updateProductsJson(uploadedFiles);
      
      console.log('\n✅ All done!');
      console.log(`Total uploaded: ${uploadedFiles.length}`);
      
      // Show sample
      if (uploadedFiles.length > 0) {
        console.log('\nSample URLs:');
        uploadedFiles.slice(0, 2).forEach(f => {
          console.log(`  ${f.publicUrl.substring(0, 120)}...`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
