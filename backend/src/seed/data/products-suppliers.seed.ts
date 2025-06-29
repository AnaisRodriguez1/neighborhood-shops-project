import { Types } from "mongoose";

// IDs de los suppliers
const DISTRIBUIDORA_CENTRAL_ID = new Types.ObjectId("66523a50123a4567890abc11");
const LACTEOS_VALLE_ID = new Types.ObjectId("66523a50123a4567890abc12");
const FRUTAS_TROPICALES_ID = new Types.ObjectId("66523a50123a4567890abc13");
const PANADERIA_ARTESANAL_ID = new Types.ObjectId("66523a50123a4567890abc14");
const LIMPIEZA_TOTAL_ID = new Types.ObjectId("66523a50123a4567890abc15");

// Productos de proveedores (solo supplierId, sin shopId)
export const supplierProducts = [
  // Productos de Distribuidora Central
  {
    name: "Arroz Grado 1 - 1kg",
    price: 1200,
    description: "Arroz de primera calidad, ideal para todas las preparaciones",
    tags: ["arroz", "granos", "basicos"],
    calories: 130,
    stock: 500,
    images: ["https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=400&h=400&fit=crop&crop=center"],
    supplierId: DISTRIBUIDORA_CENTRAL_ID
  },
  {
    name: "Aceite Vegetal - 1L",
    price: 2890,
    description: "Aceite vegetal puro, perfecto para cocinar y freír",
    tags: ["aceite", "cocina", "liquidos"],
    calories: 884,
    stock: 200,
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&crop=center"],
    supplierId: DISTRIBUIDORA_CENTRAL_ID
  },
  {
    name: "Azúcar Granulada - 1kg",
    price: 1590,
    description: "Azúcar granulada refinada, endulzante natural",
    tags: ["azucar", "endulzante", "basicos"],
    calories: 387,
    stock: 300,
    images: ["https://images.unsplash.com/photo-1563193225-fa5135d4c0da?w=400&h=400&fit=crop&crop=center"],
    supplierId: DISTRIBUIDORA_CENTRAL_ID
  },
  {
    name: "Harina Integral - 1kg",
    price: 1890,
    description: "Harina integral de trigo, perfecta para panificación saludable",
    tags: ["harina", "integral", "panificacion"],
    calories: 340,
    stock: 150,
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center"],
    supplierId: DISTRIBUIDORA_CENTRAL_ID
  },
  {
    name: "Fideos Espagueti - 500g",
    price: 1290,
    description: "Fideos espagueti de sémola de trigo, cocción perfecta",
    tags: ["fideos", "pasta", "espagueti"],
    calories: 131,
    stock: 250,
    images: ["https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=400&fit=crop&crop=center"],
    supplierId: DISTRIBUIDORA_CENTRAL_ID
  },
  
  // Productos de Lácteos del Valle
  {
    name: "Leche Entera - 1L",
    price: 950,
    description: "Leche fresca entera del valle, rica en calcio y proteínas",
    tags: ["leche", "lacteos", "liquidos"],
    calories: 61,
    stock: 150,
    images: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&crop=center"],
    supplierId: LACTEOS_VALLE_ID
  },
  {
    name: "Queso Gauda - 200g",
    price: 3490,
    description: "Queso gauda madurado, sabor suave y cremoso",
    tags: ["queso", "lacteos", "gauda"],
    calories: 356,
    stock: 80,
    images: ["https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=400&fit=crop&crop=center"],
    supplierId: LACTEOS_VALLE_ID
  },
  {
    name: "Yogur Natural - 150g",
    price: 890,
    description: "Yogur natural cremoso, rico en probióticos",
    tags: ["yogur", "lacteos", "natural"],
    calories: 59,
    stock: 120,
    images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&crop=center"],
    supplierId: LACTEOS_VALLE_ID
  },
  {
    name: "Mantequilla - 250g",
    price: 2490,
    description: "Mantequilla cremosa sin sal, ideal para repostería",
    tags: ["mantequilla", "lacteos", "reposteria"],
    calories: 717,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1589985269047-0dbf5ed50c5d?w=400&h=400&fit=crop&crop=center"],
    supplierId: LACTEOS_VALLE_ID
  },
  {
    name: "Crema de Leche - 200ml",
    price: 1690,
    description: "Crema de leche para cocinar, espesa y cremosa",
    tags: ["crema", "lacteos", "cocina"],
    calories: 345,
    stock: 90,
    images: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&crop=center"],
    supplierId: LACTEOS_VALLE_ID
  },

  // Productos de Frutas Tropicales
  {
    name: "Plátano Ecuatoriano - 1kg",
    price: 1890,
    description: "Plátanos frescos del Ecuador, dulces y nutritivos",
    tags: ["platano", "frutas", "tropical"],
    calories: 89,
    stock: 200,
    images: ["https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400&h=400&fit=crop&crop=center"],
    supplierId: FRUTAS_TROPICALES_ID
  },
  {
    name: "Mango Tommy - 1 un.",
    price: 1200,
    description: "Mangos Tommy frescos, jugosos y aromáticos",
    tags: ["mango", "frutas", "tropical"],
    calories: 60,
    stock: 100,
    images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&crop=center"],
    supplierId: FRUTAS_TROPICALES_ID
  },
  {
    name: "Piña Golden - 1 un.",
    price: 2890,
    description: "Piña golden dulce y jugosa, rica en vitamina C",
    tags: ["piña", "frutas", "tropical"],
    calories: 50,
    stock: 80,
    images: ["https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop&crop=center"],
    supplierId: FRUTAS_TROPICALES_ID
  },
  {
    name: "Papaya - 1 un.",
    price: 2190,
    description: "Papaya fresca, rica en enzimas digestivas",
    tags: ["papaya", "frutas", "tropical"],
    calories: 43,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&h=400&fit=crop&crop=center"],
    supplierId: FRUTAS_TROPICALES_ID
  },

  // Productos de Panadería Artesanal
  {
    name: "Pan Integral - 1 un.",
    price: 1890,
    description: "Pan integral artesanal, rico en fibra",
    tags: ["pan", "integral", "panaderia"],
    calories: 247,
    stock: 50,
    images: ["https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center"],
    supplierId: PANADERIA_ARTESANAL_ID
  },
  {
    name: "Hallulla - Bolsa 6 un.",
    price: 1200,
    description: "Hallullas tradicionales chilenas, frescas del día",
    tags: ["hallulla", "pan", "tradicional"],
    calories: 180,
    stock: 80,
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center"],
    supplierId: PANADERIA_ARTESANAL_ID
  },
  {
    name: "Pan Marraqueta - Bolsa 4 un.",
    price: 990,
    description: "Pan marraqueta tradicional chileno, crujiente por fuera",
    tags: ["marraqueta", "pan", "tradicional"],
    calories: 160,
    stock: 100,
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center"],
    supplierId: PANADERIA_ARTESANAL_ID
  },
  {
    name: "Dobladitas - Bolsa 8 un.",
    price: 1490,
    description: "Dobladitas chilenas recién horneadas",
    tags: ["dobladitas", "pan", "tradicional"],
    calories: 140,
    stock: 70,
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center"],
    supplierId: PANADERIA_ARTESANAL_ID
  },

  // Productos de Limpieza Total
  {
    name: "Detergente Líquido - 1L",
    price: 2890,
    description: "Detergente líquido concentrado para ropa",
    tags: ["detergente", "limpieza", "liquido"],
    calories: 0,
    stock: 150,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center"],
    supplierId: LIMPIEZA_TOTAL_ID
  },
  {
    name: "Desinfectante - 500ml",
    price: 1890,
    description: "Desinfectante multiuso para superficies",
    tags: ["desinfectante", "limpieza", "hogar"],
    calories: 0,
    stock: 200,
    images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center"],
    supplierId: LIMPIEZA_TOTAL_ID
  },
  {
    name: "Jabón Lavaloza - 500ml",
    price: 1290,
    description: "Jabón líquido para lavar loza, desengrasante",
    tags: ["jabon", "lavaloza", "limpieza"],
    calories: 0,
    stock: 180,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center"],
    supplierId: LIMPIEZA_TOTAL_ID
  },
  {
    name: "Cloro - 1L",
    price: 1590,
    description: "Cloro desinfectante para baños y cocina",
    tags: ["cloro", "desinfectante", "baño"],
    calories: 0,
    stock: 120,
    images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center"],
    supplierId: LIMPIEZA_TOTAL_ID
  },
  {
    name: "Esponjas - Paquete 3 un.",
    price: 890,
    description: "Esponjas para lavar loza, doble cara",
    tags: ["esponjas", "limpieza", "loza"],
    calories: 0,
    stock: 200,
    images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center"],
    supplierId: LIMPIEZA_TOTAL_ID
  }
];

// Procesar productos de suppliers para agregar slug
export const processedSupplierProducts = supplierProducts.map(p => {
  const slug = p.name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return {
    ...p,
    slug
  };
});
