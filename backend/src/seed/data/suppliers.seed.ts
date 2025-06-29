import { Types } from 'mongoose';

export const suppliers = [
  {
    _id: new Types.ObjectId('66523a50123a4567890abc11'),
    name: "Distribuidora Central",
    description: "Proveedor principal de productos básicos y alimentarios",
    contactEmail: "ventas@distribuidoracentral.com",
    contactPhone: "+569 2222 3333",
    address: "Santiago, Chile",
    isActive: true,
    categories: ["alimentarios", "bebidas", "productos-basicos"]
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc12'),
    name: "Lácteos del Valle",
    description: "Especialistas en productos lácteos frescos",
    contactEmail: "info@lacteosdevalle.com",
    contactPhone: "+569 2444-5555",
    address: "Santiago, Chile",
    isActive: true,
    categories: ["lacteos", "quesos", "yogures"]
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc13'),
    name: "Frutas y Verduras Tropicales",
    description: "Proveedor de frutas y verduras frescas",
    contactEmail: "pedidos@frutastropicales.com",
    contactPhone: "+569 2666-7777",
    address: "Santiago, Chile",
    isActive: true,
    categories: ["frutas", "verduras", "productos-frescos"]
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc14'),
    name: "Panadería Artesanal",
    description: "Pan fresco y productos de panadería",
    contactEmail: "contacto@panaderiaartesanal.com",
    contactPhone: "+569 2888-9999",
    address: "Santiago, Chile",
    isActive: true,
    categories: ["panaderia", "reposteria", "pan-fresco"]
  },
  {
    _id: new Types.ObjectId('66523a50123a4567890abc15'),
    name: "Limpieza Total",
    description: "Productos de limpieza y aseo para el hogar",
    contactEmail: "ventas@limpiezatotal.com",
    contactPhone: "+569 2111-2222",
    address: "Santiago, Chile",
    isActive: true,
    categories: ["limpieza", "aseo", "hogar"]
  }
];
