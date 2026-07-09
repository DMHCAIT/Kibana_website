import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://opkgstmsfyjzbympczwd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa2dzdG1zZnlqemJ5bXBjendkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4NDgyNjAsImV4cCI6MjAzNTQyNDI2MH0.8fpjVz7wjPFDm-t7AaGC0dFvpBMzGq7K6rLoA4fJ3fI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

async function uploadFilesToSupabase() {
  const localDir = path.join(__dirname, '../public/kibana_product_images');
  const files = getAllFiles(localDir);
  
  console.log(`Found ${files.length} files to upload`);
  
  let successCount = 0;
  let errorCount = 0;
  const uploadedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileBuffer = fs.readFileSync(file.fullPath);
    
    // Path for Supabase: kibana_product_images/1 collection/... 
    const supabasePath = `kibana_product_images/${file.relativePath}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(supabasePath, fileBuffer, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`❌ Upload failed for ${file.relativePath}: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
        uploadedFiles.push({
          originalPath: `/${file.relativePath}`,
          supabasePath: supabasePath,
          publicUrl: `${SUPABASE_URL}/storage/v1/object/public/product-images/${supabasePath}`
        });
        
        if ((i + 1) % 20 === 0) {
          console.log(`Uploaded ${i + 1}/${files.length} files...`);
        }
      }
    } catch (err) {
      console.error(`❌ Error uploading ${file.relativePath}: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Upload complete! Success: ${successCount}, Errors: ${errorCount}`);
  
  // Save mapping for reference
  fs.writeFileSync(
    path.join(__dirname, 'upload-mapping.json'),
    JSON.stringify(uploadedFiles.slice(0, 10), null, 2)
  );
  
  return uploadedFiles;
}

async function updateProductsJson(uploadedFiles) {
  const productsPath = path.join(__dirname, '../src/data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  
  // Create a map for quick lookup
  const fileMap = {};
  uploadedFiles.forEach(file => {
    fileMap[file.originalPath] = file.publicUrl;
  });
  
  // Function to update URLs in a product
  const updateUrls = (product) => {
    if (product.image && fileMap[product.image]) {
      product.image = fileMap[product.image];
    }
    
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery = product.gallery.map(url => fileMap[url] || url);
    }
    
    if (product.video && fileMap[product.video]) {
      product.video = fileMap[product.video];
    }
    
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      product.colorVariants = product.colorVariants.map(cv => {
        if (cv.image && fileMap[cv.image]) {
          cv.image = fileMap[cv.image];
        }
        if (cv.gallery && Array.isArray(cv.gallery)) {
          cv.gallery = cv.gallery.map(url => fileMap[url] || url);
        }
        return cv;
      });
    }
    
    return product;
  };
  
  const updatedProducts = products.map(updateUrls);
  fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
  
  console.log('✅ Updated products.json with Supabase URLs');
}

// Main execution
(async () => {
  console.log('Starting upload to Supabase...\n');
  
  try {
    const uploadedFiles = await uploadFilesToSupabase();
    
    // Only update products.json if we have uploaded files
    if (uploadedFiles.length > 0) {
      await updateProductsJson(uploadedFiles);
    }
    
    console.log('\n✅ Process complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
