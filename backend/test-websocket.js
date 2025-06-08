const { io } = require('socket.io-client');
const fetch = require('node-fetch');

async function getAuthToken() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },      body: JSON.stringify({
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

async function testWebSocket() {
  console.log('🔐 Getting authentication token...');
  const token = await getAuthToken();
  
  if (!token) {
    console.error('❌ Failed to get authentication token');
    return;
  }
  
  console.log('✅ Token obtained successfully');
  console.log('🔌 Connecting to Socket.IO namespace /orders...');
  
  const socket = io('http://localhost:8080/orders', {
    auth: {
      token: token
    }
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected! Socket ID:', socket.id);
    
    // Join room for client notifications (using first user ID from our seed data)
    socket.emit('join-room', {
      role: 'comprador',
      id: '684501011c5d7d08ca64fbe2' // This should be our first user ID
    });
    
    console.log('📡 Joined client room for notifications');
  });
  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error);
    setTimeout(() => {
      console.log('🔚 Exiting due to connection error...');
      process.exit(1);
    }, 2000);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
  });

  // Listen for order events
  socket.on('order-created', (data) => {
    console.log('🆕 ORDER CREATED:', JSON.stringify(data, null, 2));
  });

  socket.on('order-status-updated', (data) => {
    console.log('🔄 ORDER STATUS UPDATED:', JSON.stringify(data, null, 2));
  });

  socket.on('order-assigned', (data) => {
    console.log('👤 ORDER ASSIGNED TO DELIVERY:', JSON.stringify(data, null, 2));
  });

  socket.on('delivery-location-updated', (data) => {
    console.log('📍 DELIVERY LOCATION UPDATED:', JSON.stringify(data, null, 2));
  });
  // Keep the connection alive for testing
  setTimeout(() => {
    console.log('⏰ Closing Socket.IO connection after 10 seconds...');
    socket.disconnect();
    // Ensure the process exits
    setTimeout(() => {
      console.log('🔚 Test completed, exiting...');
      process.exit(0);
    }, 1000);
  }, 10000);
}

console.log('🚀 Starting WebSocket test...');

// Handle process interruption (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted by user');
  process.exit(0);
});

testWebSocket();
