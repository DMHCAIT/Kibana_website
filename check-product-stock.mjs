import http from 'http';

console.log('🔍 Checking Product Stock Status from Database\n');

http.get('http://localhost:3001/api/products', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const products = JSON.parse(data);
    
    console.log(`Total products: ${products.length}\n`);
    
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   In Stock (Main): ${product.inStock ?? 'not set'}`);
      
      if (product.colorVariants && product.colorVariants.length > 0) {
        console.log(`   Color Variants:`);
        product.colorVariants.forEach((variant) => {
          const stockStatus = variant.inStock !== false ? '✅ YES' : '❌ NO';
          console.log(`     - ${variant.color}: ${stockStatus}`);
        });
      }
      console.log('');
    });
    
    console.log('✅ Database products check complete');
  });
}).on('error', (err) => {
  console.log('❌ Error:', err.message);
});
