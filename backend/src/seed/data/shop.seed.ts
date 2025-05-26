import { Types } from 'mongoose';
import slugify from 'slugify';

export const shops = [
  {
    _id: new Types.ObjectId('66523a50123a4567890abc01'),
    ownerId: new Types.ObjectId('6833b8b13a4d7067a5b9ffb8'),
    name: 'Verdulería El Honguito',
    slug: slugify('Verdulería El Honguito', { lower: true, strict: true }),
    description: 'Frutas y verduras frescas directo del productor.',
    address: 'Calle Fresia 123, La Serena',
    deliveryAvailable: true,
    pickupAvailable: true,
    score: 0,
    totalSales: 0,
    categories: ['comida', 'hogar'],
    isActive: true,
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc02'),
    ownerId: new Types.ObjectId('6833b8b13a4d7067a5b9ffb8'),
    name: 'ElectroMundo',
    slug: slugify('ElectroMundo', { lower: true, strict: true }),
    description: 'Tecnología y electrodomésticos a tu alcance.',
    address: 'Av. Los Carrera 456, Coquimbo',
    deliveryAvailable: false,
    pickupAvailable: true,
    score: 0,
    totalSales: 0,
    categories: ['electronica', 'hogar'],
    isActive: true,
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc03'),
    ownerId: new Types.ObjectId('6833b8b13a4d7067a5b9ffb8'),
    name: 'Farmacia Natural',
    slug: slugify('Farmacia Natural', { lower: true, strict: true }),
    description: 'Productos naturales y farmacéuticos para tu bienestar.',
    address: 'Plaza de Armas 789, La Serena',
    deliveryAvailable: true,
    pickupAvailable: false,
    score: 0,
    totalSales: 0,
    categories: ['farmacia', 'belleza'],
    isActive: true,
  }
];
