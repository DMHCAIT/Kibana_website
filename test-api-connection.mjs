import http from 'http';

console.log('📡 Testing Database Connection via API...\n');

const testEndpoints = [
  { name: 'Products API', url: 'http://localhost:3001/api/products' },
  { name: 'Categories API', url: 'http://localhost:3001/api/categories' },
  { name: 'Health Check', url: 'http://localhost:3001/api/health' },
];

for (const endpoint of testEndpoints) {
  await testEndpoint(endpoint);
}

async function testEndpoint({ name, url }) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const time = Date.now() - startTime;
        
        try {
          const json = JSON.parse(data);
          const count = Array.isArray(json) ? json.length : 
                        json.status ? 'health check' : 'unknown';
          
          console.log(`✅ ${name}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Time: ${time}ms`);
          if (Array.isArray(json)) console.log(`   Items: ${count}`);
          if (json.database === true) console.log(`   Database: CONNECTED ✅`);
          if (json.database === false) console.log(`   Database: DISCONNECTED ❌`);
          console.log('');
        } catch (e) {
          console.log(`⚠️  ${name} - Response not JSON`);
          console.log(`   Status: ${res.statusCode}`);
          console.log('');
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve();
    });
  });
}

console.log('✅ Database Connection Test Complete\n');
