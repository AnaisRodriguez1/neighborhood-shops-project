const fetch = require('node-fetch');

async function testOrderCreation() {
  try {
    // First get shops to get real IDs
    console.log('Getting shops...');
    const shopsResponse = await fetch('http://localhost:8080/api/shops');
    const shops = await shopsResponse.json();
    console.log('Shops found:', shops.length);
      if (shops.length === 0) {
      console.log('No shops found');
      return;
    }
    
    // Try each shop until we find one with products
    let shopId, products, selectedShop;
    for (const shop of shops) {
      console.log('Checking shop:', shop.name, 'ID:', shop.id);
      const productsResponse = await fetch(`http://localhost:8080/api/products/shop/${shop.id}`);
      const shopProducts = await productsResponse.json();
      console.log('Products found for', shop.name, ':', shopProducts.length);
      
      if (shopProducts.length > 0) {
        shopId = shop.id;
        products = shopProducts;
        selectedShop = shop;
        break;
      }
    }
    
    if (!products || products.length === 0) {
      console.log('No products found in any shop');
      return;
    }
    
    console.log('Using shop:', selectedShop.name, 'ID:', shopId);
    
    const product = products[0];
    console.log('Using product:', product.name, 'ID:', product.id, 'Price:', product.price);
    
    // Create order
    console.log('Creating order...');
    const orderResponse = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzNiOGIxM2E0ZDcwNjdhNWI5ZmZiNiIsImlhdCI6MTc0OTM1MzM1OCwiZXhwIjoxNzQ5Mzg5MzU4fQ.frFxz9CcZRmIyOzcrTa-ap3QR77iZikpAkqYK4h8aFw'
      },      body: JSON.stringify({
        shopId: shopId,
        items: [
          {
            productId: product.id, 
            quantity: 2
          }
        ],
        deliveryAddress: {
          street: "Av. Francisco de Aguirre",
          number: "123",
          district: "Centro",
          city: "La Serena",
          lat: -29.9027,
          lng: -71.2489,
          reference: "Cerca de la Plaza de Armas"
        },
        paymentMethod: "efectivo",
        notes: "Test order"
      })
    });

    const orderData = await orderResponse.json();
    console.log('Order Status:', orderResponse.status);
    console.log('Order Response:', JSON.stringify(orderData, null, 2));
    
    if (orderResponse.status === 201) {
      console.log('✅ ORDER CREATED SUCCESSFULLY!');
      console.log('Order Number:', orderData.orderNumber);
    } else {
      console.log('❌ ORDER CREATION FAILED');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOrderCreation();
