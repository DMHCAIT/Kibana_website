import http from 'http';

const pages = [
  '/',
  '/shop',
  '/shop/halo-mini',
  '/about',
  '/contact',
];

const results = [];

async function fetchPage(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(`http://localhost:3001${url}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        resolve({ url, status: res.statusCode, time: loadTime, size: data.length });
      });
    }).on('error', (err) => {
      const loadTime = Date.now() - startTime;
      resolve({ url, status: 'ERROR', time: loadTime, error: err.message });
    });
  });
}

async function testAuth() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get('http://localhost:3001/api/auth/me', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          resolve({ endpoint: '/api/auth/me', status: res.statusCode, time: loadTime, authenticated: !!json.user });
        } catch {
          resolve({ endpoint: '/api/auth/me', status: res.statusCode, time: loadTime, authenticated: false });
        }
      });
    }).on('error', (err) => {
      const loadTime = Date.now() - startTime;
      resolve({ endpoint: '/api/auth/me', status: 'ERROR', time: loadTime, error: err.message });
    });
  });
}

async function checkDb() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get('http://localhost:3001/api/products', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          resolve({ 
            endpoint: '/api/products', 
            status: res.statusCode, 
            time: loadTime, 
            productCount: Array.isArray(json) ? json.length : 0 
          });
        } catch {
          resolve({ endpoint: '/api/products', status: res.statusCode, time: loadTime, productCount: 0 });
        }
      });
    }).on('error', (err) => {
      const loadTime = Date.now() - startTime;
      resolve({ endpoint: '/api/products', status: 'ERROR', time: loadTime, error: err.message });
    });
  });
}

console.log('🚀 Performance & Auth Check\n');
console.log('Testing pages at http://localhost:3001 ...\n');

// Test auth first
const authResult = await testAuth();
console.log('🔐 AUTH SYSTEM:');
console.log(`   Endpoint: ${authResult.endpoint}`);
console.log(`   Status: ${authResult.status}`);
console.log(`   Response Time: ${authResult.time}ms`);
console.log(`   Authenticated: ${authResult.authenticated ? '✓ Yes' : '✗ No (guest)'}`);
if (authResult.error) console.log(`   Error: ${authResult.error}`);
console.log('');

// Test DB
const dbResult = await checkDb();
console.log('📊 DATABASE:');
console.log(`   Endpoint: ${dbResult.endpoint}`);
console.log(`   Status: ${dbResult.status}`);
console.log(`   Response Time: ${dbResult.time}ms`);
console.log(`   Products: ${dbResult.productCount}`);
if (dbResult.error) console.log(`   Error: ${dbResult.error}`);
console.log('');

console.log('📄 PAGE LOAD TIMES:');
console.log('─'.repeat(60));

for (const page of pages) {
  const result = await fetchPage(page);
  const performance = result.time < 300 ? '⚡' : result.time < 600 ? '✓' : '⚠';
  console.log(`${performance} ${page.padEnd(30)} ${result.time}ms (${result.status})`);
}

console.log('─'.repeat(60));
console.log('\n📈 PERFORMANCE ANALYSIS:');
console.log('✅ ⚡ < 300ms: Excellent');
console.log('✅ ✓ 300-600ms: Good');
console.log('⚠️  ⚠ > 600ms: Needs optimization\n');
