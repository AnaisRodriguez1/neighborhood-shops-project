const fetch = require('node-fetch');

async function testUserSetup() {
  console.log('🚀 Testing User Setup and Authentication...');
  console.log('='.repeat(50));

  try {    // Test 1: Get all users
    console.log('📋 Test 1: Getting all users...');
    const usersResponse = await fetch('http://localhost:8080/api/auth/users');
    const usersData = await usersResponse.json();
    
    console.log('Users response status:', usersResponse.status);
    console.log('Users data:', JSON.stringify(usersData, null, 2));
    
    // Handle different response formats
    const users = Array.isArray(usersData) ? usersData : (usersData.data || usersData.users || []);
    
    if (Array.isArray(users) && users.length > 0) {
      console.log(`✅ Found ${users.length} users in the system`);
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('❌ No users found or endpoint not available');
      console.log('Continuing with login tests...');
    }

    // Test 2: Login with different user types
    console.log('\n🔐 Test 2: Testing login for different user roles...');
    
    const testUsers = [
      { email: 'presidente@test.com', password: 'Password123', expectedRole: 'presidente' },
      { email: 'tienda1@test.com', password: 'Password123', expectedRole: 'tienda' },
      { email: 'carlos@test.com', password: 'Password123', expectedRole: 'repartidor' }
    ];

    for (const testUser of testUsers) {
      try {
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });

        if (loginResponse.status === 200 || loginResponse.status === 201) {
          const loginData = await loginResponse.json();
          console.log(`   ✅ ${testUser.email} - Login successful - Role: ${loginData.role}`);
          
          if (loginData.role === testUser.expectedRole) {
            console.log(`      ✅ Role matches expected: ${testUser.expectedRole}`);
          } else {
            console.log(`      ❌ Role mismatch! Expected: ${testUser.expectedRole}, Got: ${loginData.role}`);
          }
        } else {
          console.log(`   ❌ ${testUser.email} - Login failed with status: ${loginResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${testUser.email} - Login error: ${error.message}`);
      }
    }

    console.log('\n✅ User setup test completed successfully!');

  } catch (error) {
    console.error('❌ Error in user setup test:', error.message);
  }
}

// Handle process interruption (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted by user');
  process.exit(0);
});

testUserSetup();