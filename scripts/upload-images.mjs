import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://opkgstmsfyjzbympczwd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa2dzdG1zZnlqemJ5bXBjendkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4NDgyNjAsImV4cCI6MjAzNTQyNDI2MH0.8fpjVz7wjPFDm-t7AaGC0dFvpBMzGq7K6rLoA4fJ3fI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
});

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
  
  // Upload files in batches
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const promises = batch.map(async (file) => {
      const fileBuffer = fs.readFileSync(file.fullPath);
      
      // Path for Supabase
      const supabasePath = `kibana_product_images/${file.relativePath}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(supabasePath, fileBuffer, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          console.error(`❌ ${file.relativePath}: ${error.message}`);
          errorCount++;
          return null;
        } else {
          successCount++;
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${supabasePath}`;
          uploadedFiles.push({
            originalPath: `/${file.relativePath}`,
            publicUrl: publicUrl
          });
          return publicUrl;
        }
      } catch (err) {
        console.error(`❌ ${file.relativePath}: ${err.message}`);
        errorCount++;
        return null;
      }
    });
    
    await Promise.all(promises);
    console.log(`Progress: ${Math.min(i + batchSize, files.length)}/${files.length}`);
  }
  
  console.log(`\n✅ Upload complete! Success: ${successCount}, Errors: ${errorCount}`);
  return uploadedFiles;
}

// Main execution
(async () => {
  console.log('Starting upload to Supabase...\n');
  
  try {
    const uploadedFiles = await uploadFilesToSupabase();
    console.log(`\nUploaded ${uploadedFiles.length} files`);
    
    // Display sample URLs
    if (uploadedFiles.length > 0) {
      console.log('\nSample URLs:');
      uploadedFiles.slice(0, 3).forEach(f => {
        console.log(`  ${f.originalPath}`);
        console.log(`  → ${f.publicUrl.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
