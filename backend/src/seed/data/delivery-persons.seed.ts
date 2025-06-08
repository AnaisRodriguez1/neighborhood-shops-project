import * as bcrypt from 'bcrypt';

export const deliveryPersons = [
  {
    email: 'repartidor1@delivery.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'Carlos Repartidor Serena',
    role: 'repartidor',
    isActive: true,
    deliveryInfo: {
      vehicle: 'motocicleta',
      isAvailable: true,
      currentLocation: {
        lat: -29.9027,  // La Serena
        lng: -71.2519
      }
    }
  },
  {
    email: 'repartidor2@delivery.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'María Delivery Coquimbo',
    role: 'repartidor',
    isActive: true,
    deliveryInfo: {
      vehicle: 'bicicleta',
      isAvailable: true,
      currentLocation: {
        lat: -29.9533,  // Coquimbo
        lng: -71.3436
      }
    }
  },
  {
    email: 'repartidor3@delivery.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'Luis Motero Vicuña',
    role: 'repartidor',
    isActive: true,
    deliveryInfo: {
      vehicle: 'motocicleta',
      isAvailable: false,
      currentLocation: {
        lat: -30.0311,  // Vicuña
        lng: -70.7081
      }
    }
  }
];
