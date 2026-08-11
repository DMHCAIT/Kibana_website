import http from 'http';

console.log('🔍 Checking Orders in Database\n');

const endpoints = [
  { name: 'Orders API', url: 'http://localhost:3001/api/admin/orders' },
  { name: 'Cart Items API', url: 'http://localhost:3001/api/admin/cart-items' },
];

for (const endpoint of endpoints) {
  await checkEndpoint(endpoint);
}

async function checkEndpoint({ name, url }) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const time = Date.now() - startTime;
        
        console.log(`Endpoint: ${name}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response Time: ${time}ms`);
        
        try {
          const json = JSON.parse(data);
          if (Array.isArray(json)) {
            console.log(`Items: ${json.length}`);
            if (json.length > 0) {
              console.log('Sample:', JSON.stringify(json[0], null, 2).substring(0, 300));
            }
          } else {
            console.log('Response:', JSON.stringify(json).substring(0, 300));
          }
        } catch (e) {
          console.log('Response (non-JSON):', data.substring(0, 200));
        }
        console.log('');
        resolve();
      });
    }).on('error', (err) => {
      console.log(`Error: ${err.message}\n`);
      resolve();
    });
  });
}
