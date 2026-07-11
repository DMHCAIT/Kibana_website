import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

async function syncProducts() {
  console.log('\n🔄 Syncing Products to Supabase Database...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  
  try {
    // Read products.json
    const productsPath = path.join('src', 'data', 'products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    console.log(`📊 Loaded ${products.length} products from JSON\n`);
    
    // Connect to database
    const sql = postgres(dbUrl, {
      ssl: 'require',
      idle_timeout: 5,
      max_lifetime: 30,
    });
    
    console.log('✅ Connected to Supabase\n');
    
    // Update each product
    let successCount = 0;
    let failCount = 0;
    
    for (const product of products) {
      try {
        await sql`
          UPDATE products 
          SET 
            image = ${product.image},
            gallery = ${JSON.stringify(product.gallery)},
            color_variants = ${JSON.stringify(product.colorVariants)},
            video = ${product.video || null},
            updated_at = NOW()
          WHERE id = ${product.id}
        `;
        
        console.log(`✅ Updated: ${product.name}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to update ${product.name}: ${err.message}`);
        failCount++;
      }
    }
    
    await sql.end();
    
    console.log(`\n📈 Results: ${successCount} updated, ${failCount} failed`);
    console.log('\n🎉 Product sync complete!\n');
    
    if (failCount > 0) {
      process.exit(1);
    }
    
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

syncProducts();
