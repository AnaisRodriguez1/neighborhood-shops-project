const { io } = require('socket.io-client');
const fetch = require('node-fetch');

async function getAuthToken() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

async function createTestOrder(token) {
  try {
    const response = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({        shopId: "66523a50123a4567890abc01", // Verdulería El Honguito
        items: [
          {
            productId: "684501011c5d7d08ca64fbe7", // Aguacate Hass (first product from API response)
            quantity: 1
          }
        ],
        deliveryAddress: {
          street: "Test Address for WebSocket",
          number: "123",
          district: "Centro",
          city: "La Serena",
          lat: -29.9027,
          lng: -71.2519
        },
        paymentMethod: "efectivo",
        notes: "Orden para testing WebSocket notifications"
      })
    });
      const data = await response.json();
    console.log('📦 Order created:', data.order?.id, '- Status:', data.order?.status);
    return data.order;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return null;
  }
}

async function updateOrderStatus(token, orderId, status) {
  try {
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
    console.log(`🔄 Order status updated to: ${status}`);
    return data;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return null;
  }
}

async function assignDeliveryPerson(token, orderId, deliveryPersonId) {
  try {
    const response = await fetch(`http://localhost:8080/api/orders/${orderId}/assign-delivery`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        deliveryPersonId: deliveryPersonId
      })
    });
    
    const data = await response.json();
    console.log('👤 Delivery person assigned');
    return data;
  } catch (error) {
    console.error('❌ Error assigning delivery person:', error);
    return null;
  }
}

async function testCompleteWebSocketFlow() {
  console.log('🚀 Starting Complete WebSocket Flow Test...');
  console.log('='.repeat(50));
  
  // Get authentication token
  console.log('🔐 Getting authentication token...');
  const token = await getAuthToken();
  
  if (!token) {
    console.error('❌ Failed to get authentication token');
    return;
  }
  
  console.log('✅ Token obtained successfully');
  
  // Connect to WebSocket
  console.log('🔌 Connecting to Socket.IO namespace /orders...');
  
  const socket = io('http://localhost:8080/orders', {
    auth: {
      token: token
    }
  });
  
  // Setup WebSocket event listeners
  socket.on('connect', async () => {
    console.log('✅ Socket.IO connected! Socket ID:', socket.id);    // Join room for client notifications (using the president user ID since they're creating the order)
    socket.emit('join-room', {
      role: 'comprador',
      id: '6833b8b13a4d7067a5b9ffb6' // President user ID who is creating the order
    });
    
    // Also join delivery room to see delivery notifications
    socket.emit('join-room', {
      role: 'repartidor',
      id: '684501011c5d7d08ca64fbf2' // Carlos delivery person ID
    });
    
    console.log('📡 Joined client room for notifications');
    console.log('='.repeat(50));
    
    // Wait a moment for room joining
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 1: Create a new order
    console.log('🆕 Step 1: Creating new order...');
    const order = await createTestOrder(token);
    
    if (!order) {
      console.error('❌ Failed to create order');
      socket.disconnect();
      return;
    }
    
    console.log('✅ Order created successfully:', order.orderNumber);
    
    // Wait for WebSocket notification
    await new Promise(resolve => setTimeout(resolve, 2000));
      // Step 2: Update order status to 'confirmado'
    console.log('🔄 Step 2: Confirming order...');
    await updateOrderStatus(token, order.id, 'confirmado');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Update order status to 'preparando'
    console.log('🍳 Step 3: Preparing order...');
    await updateOrderStatus(token, order.id, 'preparando');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Update order status to 'listo'
    console.log('✅ Step 4: Order ready...');
    await updateOrderStatus(token, order.id, 'listo');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Assign delivery person
    console.log('🚴 Step 5: Assigning delivery person...');
    await assignDeliveryPerson(token, order.id, '684501011c5d7d08ca64fbf2'); // Carlos from seed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Update status to 'entregado'
    console.log('📦 Step 6: Marking as delivered...');
    await updateOrderStatus(token, order.id, 'entregado');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('='.repeat(50));
    console.log('🎉 Complete order flow test finished!');
    console.log('Keeping connection alive for 10 more seconds to see any final notifications...');
    
    setTimeout(() => {
      console.log('⏰ Closing Socket.IO connection...');
      socket.disconnect();
    }, 10000);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
  });

  // Listen for order events
  socket.on('order-created', (data) => {
    console.log('🎊 NOTIFICATION - ORDER CREATED:');
    console.log(`   Order ID: ${data.orderId || data.order?._id}`);
    console.log(`   Message: ${data.message}`);
    console.log();
  });

  socket.on('order-status-updated', (data) => {
    console.log('🔔 NOTIFICATION - ORDER STATUS UPDATED:');
    console.log(`   Order ID: ${data.orderId}`);
    console.log(`   New Status: ${data.status}`);
    console.log(`   Message: ${data.message}`);
    if (data.deliveryPerson) {
      console.log(`   Delivery Person: ${data.deliveryPerson}`);
    }
    console.log();
  });
  socket.on('order-assigned', (data) => {
    console.log('👨‍🚴 NOTIFICATION - ORDER ASSIGNED TO DELIVERY:');
    console.log(`   Order ID: ${data.orderId || data.order?.id}`);
    console.log(`   Message: ${data.message}`);
    console.log();
  });

  socket.on('delivery-location-updated', (data) => {
    console.log('📍 NOTIFICATION - DELIVERY LOCATION UPDATED:');
    console.log(`   Delivery ID: ${data.deliveryId}`);
    console.log(`   Location: ${data.location.lat}, ${data.location.lng}`);
    console.log();
  });
}

console.log('🚀 Starting Complete WebSocket & Order Management Test...');
testCompleteWebSocketFlow();
