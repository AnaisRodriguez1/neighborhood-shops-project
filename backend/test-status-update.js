const { io } = require('socket.io-client');
const fetch = require('node-fetch');

// Test de actualización de estado específico
async function getAuthToken() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'presidente@test.com',
        password: 'Password123'
      })
    });
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return null;
  }
}

async function updateOrderStatus(token, orderId, status) {
  try {
    console.log(`🔄 Updating order ${orderId} to status: ${status}`);
    const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: status
      })
    });
    
    const data = await response.json();
    console.log('✅ Status update response:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return null;
  }
}

async function testStatusUpdates() {
  console.log('🚀 Testing Status Update WebSocket Notifications');
  console.log('='.repeat(60));

  // Get token
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ Failed to get authentication token');
    return;
  }
  console.log('✅ Authentication successful');

  // Connect to WebSocket
  console.log('🔌 Connecting to WebSocket...');
  const socket = io('http://localhost:8080/orders', {
    auth: { token: token }
  });

  // Set up WebSocket listeners
  socket.on('connect', () => {
    console.log('✅ WebSocket connected! Socket ID:', socket.id);
    
    // Join client room (using president user ID)
    socket.emit('join-room', {
      role: 'comprador',
      id: '6833b8b13a4d7067a5b9ffb6' // President user ID
    });
    console.log('📡 Joined client room for notifications');
  });

  socket.on('order-status-updated', (data) => {
    console.log('🎊 STATUS UPDATE NOTIFICATION RECEIVED:');
    console.log('   Order ID:', data.orderId);
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);
  });

  socket.on('order-created', (data) => {
    console.log('🆕 ORDER CREATED NOTIFICATION:');
    console.log('   Order ID:', data.order?._id);
    console.log('   Message:', data.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test with a known order ID - let's use one we can create first
  console.log('\n📦 Creating test order first...');
  
  try {
    const orderResponse = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        shopId: "66523a50123a4567890abc01", // Verdulería El Honguito
        items: [
          {
            productId: "684501011c5d7d08ca64fbe7", // Aguacate Hass  
            quantity: 1
          }
        ],
        deliveryAddress: {
          street: "Av. Francisco de Aguirre",
          number: "485",
          district: "Centro",
          city: "La Serena",
          lat: -29.9027,
          lng: -71.2519
        },
        paymentMethod: "efectivo"
      })
    });    const orderData = await orderResponse.json();
    console.log('✅ Test order created:', orderData.order?.id);
    
    const orderId = orderData.order?.id;
    
    if (!orderId) {
      console.error('❌ No order ID returned');
      socket.disconnect();
      return;
    }

    console.log('\n🔄 Testing status updates...');
    
    // Test status updates with delays
    await new Promise(resolve => setTimeout(resolve, 2000));
    await updateOrderStatus(token, orderId, 'confirmado');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await updateOrderStatus(token, orderId, 'preparando');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await updateOrderStatus(token, orderId, 'listo');
    
    console.log('\n⏰ Waiting 10 seconds for any remaining notifications...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }

  console.log('\n🔚 Test completed. Disconnecting...');
  socket.disconnect();
}

// Run the test
testStatusUpdates().catch(console.error);
