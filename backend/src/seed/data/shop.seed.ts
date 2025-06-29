import { Types } from 'mongoose';
import slugify from 'slugify';

const ANAIS_ID = new Types.ObjectId('68455a40421a1863eccc418d')

export const shops = [
  {
    _id: new Types.ObjectId('66523a50123a4567890abc01'),
    ownerId: ANAIS_ID,
    name: 'Verdulería El Honguito',
    slug: slugify('Verdulería El Honguito', { lower: true, strict: true }),    description: 'Frutas y verduras frescas directo del valle de Elqui y La Serena.',
    address: 'Av. Francisco de Aguirre 485, La Serena, Región de Coquimbo',
    deliveryAvailable: true,
    pickupAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop&crop=center'
    ],
    score: 0,
    totalSales: 0,
    categories: ['comida', 'hogar'],
    isActive: true,
  },  {
    _id: new Types.ObjectId('66523a50123a4567890abc02'),
    ownerId: ANAIS_ID,
    name: 'ElectroMundo Coquimbo',
    slug: slugify('ElectroMundo Coquimbo', { lower: true, strict: true }),
    description: 'Tecnología y electrodomésticos para el hogar en Coquimbo.',
    address: 'Av. Los Carrera 1456, Coquimbo, Región de Coquimbo',
    deliveryAvailable: false,
    pickupAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&h=120&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop&crop=center'
    ],
    score: 0,
    totalSales: 0,
    categories: ['electronica', 'hogar'],
    isActive: true,
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc03'),
    ownerId: ANAIS_ID,
    name: 'Farmacia Vicuña',
    slug: slugify('Farmacia Vicuña', { lower: true, strict: true }),
    description: 'Productos farmacéuticos y naturales del valle de Elqui.',
    address: 'Plaza de Armas 789, Vicuña, Región de Coquimbo',
    deliveryAvailable: true,
    pickupAvailable: false,
    images: [
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=120&h=120&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&h=400&fit=crop&crop=center'
    ],
    score: 0,
    totalSales: 0,
    categories: ['farmacia', 'belleza'],
    isActive: true,
  }
];
