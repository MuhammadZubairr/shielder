import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testSupplierAPI() {
  try {
    // 1. Login first
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: '123456'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful');
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    // 2. Fetch active suppliers
    console.log('\n📦 Fetching active suppliers...');
    const suppliersResponse = await fetch(`${API_BASE}/suppliers/active`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status:', suppliersResponse.status);
    const suppliersData = await suppliersResponse.json();
    console.log('Response:', JSON.stringify(suppliersData, null, 2));

    if (suppliersData.data && Array.isArray(suppliersData.data)) {
      console.log(`\n✅ Found ${suppliersData.data.length} suppliers:`);
      suppliersData.data.forEach(s => {
        console.log(`  - ${s.name} (${s.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSupplierAPI();
