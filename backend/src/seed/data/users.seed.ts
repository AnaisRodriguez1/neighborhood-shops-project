import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export const users = [
  // Presidente user
  {
    _id: new Types.ObjectId('6833b8b13a4d7067a5b9ffb6'),
    email: 'presidente@test.com',
    password: bcrypt.hashSync('Password123', 10),
    name: 'Admin Presidente',
    role: 'presidente',
    isActive: true,
  },
  // Shop owners (locatarios)
  {
    _id: new Types.ObjectId('6833b8b13a4d7067a5b9ffb8'),
    email: 'shopowner1@test.com',
    password: bcrypt.hashSync('Password123', 10),
    name: 'Pedro Verdulero',
    role: 'locatario',
    isActive: true,
  },
  {
    _id: new Types.ObjectId('6833b8b13a4d7067a5b9ffb9'),
    email: 'shopowner2@test.com',
    password: bcrypt.hashSync('Password123', 10),
    name: 'Ana Tecnología',
    role: 'locatario',
    isActive: true,
  },
  {
    _id: new Types.ObjectId('6833b8b13a4d7067a5b9ffba'),
    email: 'shopowner3@test.com',
    password: bcrypt.hashSync('Password123', 10),
    name: 'Luis Farmacéutico',
    role: 'locatario',
    isActive: true,
  },
  // Sample customers
  {
    _id: new Types.ObjectId('6833b8b13a4d7067a5b9ffbb'),
    email: 'cliente1@test.com',
    password: bcrypt.hashSync('Password123', 10),
    name: 'María Cliente',
    role: 'comprador',
    isActive: true,
  },
  {
    _id: new Types.ObjectId('6833b8b13a4d7067a5b9ffbc'),
    email: 'cliente2@test.com',
    password: bcrypt.hashSync('Password123', 10),
    name: 'Juan Comprador',
    role: 'comprador',
    isActive: true,
  }
];
