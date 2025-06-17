import { Types } from 'mongoose';

export const orders = [
  {
    totalAmount: 4770,
    shop: new Types.ObjectId('66523a50123a4567890abc01'), // Verdulería El Honguito
    client: new Types.ObjectId('68453456ff372f0db4d4e76e'), // ID de algún cliente existente
    customer: {
      name: 'Juan Pérez Carvajal',
      email: 'juan.perez@laserena.com',
      phone: '+56951234567'
    },
    items: [
      {
        product: new Types.ObjectId('66523a50123a4567890def01'), // Lechuga Costina
        productId: '66523a50123a4567890def01',
        productName: 'Lechuga Costina 1 un.',
        quantity: 2,
        price: 1390,
        unitPrice: 1390,
        subtotal: 2780
      },
      {
        product: new Types.ObjectId('66523a50123a4567890def02'), // Tomate Cherry
        productId: '66523a50123a4567890def02',
        productName: 'Tomate Cherry 250 g',
        quantity: 1,
        price: 1990,
        unitPrice: 1990,
        subtotal: 1990
      }
    ],
    total: 4770,
    deliveryAddress: {
      street: 'Av. Francisco de Aguirre 485',
      number: '485',
      neighborhood: 'Centro',
      district: 'La Serena',
      city: 'La Serena',
      postalCode: '1700000',
      coordinates: {
        lat: -29.9027,
        lng: -71.2519
      }
    },
    paymentMethod: 'efectivo',
    status: 'pendiente',
    estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
    notes: 'Tocar el portón principal, casa azul',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    totalAmount: 2670,
    shop: new Types.ObjectId('66523a50123a4567890abc01'), // Verdulería El Honguito
    client: new Types.ObjectId('6833b8b13a4d7067a5b9ffb9'), // ID de algún cliente existente
    customer: {
      name: 'Ana García Morales',
      email: 'ana.garcia@coquimbo.cl',
      phone: '+56987654321'
    },
    items: [
      {
        product: new Types.ObjectId('66523a50123a4567890def03'), // Palta Hass
        productId: '66523a50123a4567890def03',
        productName: 'Palta Hass 1 un.',
        quantity: 3,
        price: 890,
        unitPrice: 890,
        subtotal: 2670
      }
    ],
    total: 2670,
    deliveryAddress: {
      street: 'Av. Los Carrera 1456',
      number: '1456',
      neighborhood: 'Parte Alta',
      district: 'Coquimbo',
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
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    totalAmount: 3100,
    shop: new Types.ObjectId('66523a50123a4567890abc03'), // Farmacia Vicuña
    client: new Types.ObjectId('6833b8b13a4d7067a5b9ffba'), // ID de algún cliente existente
    customer: {
      name: 'Pedro López Silva',
      email: 'pedro.lopez@vicuna.cl',
      phone: '+56923456789'
    },
    items: [
      {
        product: new Types.ObjectId('66523a50123a4567890def04'), // Limón Sutil
        productId: '66523a50123a4567890def04',
        productName: 'Limón Sutil 1 kg',
        quantity: 1,
        price: 1200,
        unitPrice: 1200,
        subtotal: 1200
      },
      {
        product: new Types.ObjectId('66523a50123a4567890def05'), // Cebolla Blanca
        productId: '66523a50123a4567890def05',
        productName: 'Cebolla Blanca 1 kg',
        quantity: 2,
        price: 950,
        unitPrice: 950,
        subtotal: 1900
      }
    ],
    total: 3100,
    deliveryAddress: {
      street: 'Plaza de Armas 789',
      number: '789',
      neighborhood: 'Centro Histórico',
      district: 'Vicuña',
      city: 'Vicuña',
      postalCode: '1750000',
      coordinates: {
        lat: -30.0311,
        lng: -70.7081
      }
    },
    paymentMethod: 'efectivo',
    status: 'preparando',
    assignedDeliveryPerson: new Types.ObjectId('66523a50123a4567890abc03'),
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000),
    notes: 'Entregar en el valle de Elqui, casa con viñedos',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];