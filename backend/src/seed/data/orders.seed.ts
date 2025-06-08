export const orders = [
  {
    customer: {
      name: 'Juan Pérez Carvajal',
      email: 'juan.perez@laserena.com',
      phone: '+56951234567'
    },
    items: [
      {
        productId: '66523a50123a4567890def01', // Lechuga Costina
        productName: 'Lechuga Costina 1 un.',
        quantity: 2,
        unitPrice: 1390,
        subtotal: 2780
      },
      {
        productId: '66523a50123a4567890def02', // Tomate Cherry
        productName: 'Tomate Cherry 250 g',
        quantity: 1,
        unitPrice: 1990,
        subtotal: 1990
      }
    ],
    total: 4770,
    deliveryAddress: {
      street: 'Av. Francisco de Aguirre 485',
      neighborhood: 'Centro',
      city: 'La Serena',
      postalCode: '1700000',
      coordinates: {
        lat: -29.9027,
        lng: -71.2519
      }
    },
    paymentMethod: 'efectivo',
    status: 'pendiente',
    estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos desde ahora
    notes: 'Tocar el portón principal, casa azul',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    customer: {
      name: 'Ana García Morales',
      email: 'ana.garcia@coquimbo.cl',
      phone: '+56987654321'
    },
    items: [
      {
        productId: '66523a50123a4567890def03', // Palta Hass
        productName: 'Palta Hass 1 un.',
        quantity: 3,
        unitPrice: 890,
        subtotal: 2670
      }
    ],
    total: 2670,
    deliveryAddress: {
      street: 'Av. Los Carrera 1456',
      neighborhood: 'Parte Alta',
      city: 'Coquimbo',
      postalCode: '1780000',
      coordinates: {
        lat: -29.9533,
        lng: -71.3436
      }
    },
    paymentMethod: 'tarjeta',
    paymentDetails: {
      cardLast4: '1234',
      transactionId: 'txn_chile_12345'
    },
    status: 'confirmado',
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutos desde ahora
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    customer: {
      name: 'Pedro López Silva',
      email: 'pedro.lopez@vicuna.cl',
      phone: '+56923456789'
    },
    items: [
      {
        productId: '66523a50123a4567890def04', // Limón Sutil
        productName: 'Limón Sutil 1 kg',
        quantity: 1,
        unitPrice: 1200,
        subtotal: 1200
      },
      {
        productId: '66523a50123a4567890def05', // Cebolla Blanca
        productName: 'Cebolla Blanca 1 kg',
        quantity: 2,
        unitPrice: 950,
        subtotal: 1900
      }
    ],
    total: 3100,
    deliveryAddress: {
      street: 'Plaza de Armas 789',
      neighborhood: 'Centro Histórico',
      city: 'Vicuña',
      postalCode: '1750000',
      coordinates: {
        lat: -30.0311,
        lng: -70.7081
      }
    },
    paymentMethod: 'efectivo',
    status: 'preparando',
    assignedDeliveryPerson: '66523a50123a4567890abc03', // Luis Motero Vicuña
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutos desde ahora
    notes: 'Entregar en el valle de Elqui, casa con viñedos',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
