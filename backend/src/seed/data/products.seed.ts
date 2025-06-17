import { Types } from "mongoose";

// IDs de las tiendas
const VERDULERIA_ID = new Types.ObjectId("66523a50123a4567890abc01");
const ELECTROMUNDO_ID = new Types.ObjectId("66523a50123a4567890abc02"); 
const FARMACIA_ID = new Types.ObjectId("66523a50123a4567890abc03");

// Productos para Verdulería El Honguito
const verduleriaProducts = [
  {
    "name": "Lechuga Costina 1 un.",
    "price": "1390",
    "description": "Lechuga fresca cultivada en los valles de la Región de Coquimbo. Rica en vitaminas y minerales, ideal para ensaladas veraniegas.",
    "tags": "lechuga,verduras,hortaliza,verde,coquimbo",
    "calories": "13",
    "stock": "300",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286982-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Tomate Cherry 250 g",
    "price": "1990",
    "description": "Tomates cherry dulces cultivados en los valles de La Serena. Ricos en licopeno y perfectos para ensaladas.",
    "tags": "tomate,verduras,fruta,rojo,laserena",
    "calories": "18",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286983-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Palta Hass 1 un.",
    "price": "890",
    "description": "Paltas Hass premium de la Región de Coquimbo. Cremosas y nutritivas, perfectas para el desayuno chileno.",
    "tags": "palta,aguacate,verde,cremoso,coquimbo",
    "calories": "160",
    "stock": "180",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286984-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Limón Sutil 1 kg",
    "price": "1200",
    "description": "Limones sutil frescos del valle de Elqui. Ideales para piscos sour y aliños. Cultivados bajo el sol del norte de Chile.",
    "tags": "limon,citrico,amarillo,elqui,pisco",
    "calories": "29",
    "stock": "250",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286985-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Cebolla Blanca 1 kg",
    "price": "950",
    "description": "Cebollas blancas frescas de los campos de Coquimbo. Suaves y aromáticas, esenciales en la cocina chilena.",
    "tags": "cebolla,verduras,blanco,condimento",
    "calories": "40",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286986-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Uvas Moscatel 1 kg",
    "price": "2890",
    "description": "Uvas moscatel dulces del famoso valle de Elqui. Perfectas para consumo fresco o para preparar jugos naturales.",
    "tags": "uvas,fruta,dulce,elqui,moscatel",
    "calories": "69",
    "stock": "150",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286987-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Pimentón Rojo 1 un.",
    "price": "1590",
    "description": "Pimentón rojo dulce, rico en vitamina C y antioxidantes. Añade color y sabor a tus ensaladas y salteados.",
    "tags": "pimentón,verduras,rojo,saludable",
    "calories": "31",
    "stock": "140",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286988-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Brócoli 500 g",
    "price": "2190",
    "description": "Brócoli fresco, fuente de vitaminas K y C, fibra y fitonutrientes. Ideal al vapor o salteado.",
    "tags": "brócoli,verduras,verde,nutritivo",
    "calories": "34",
    "stock": "160",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286989-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Espinaca Manojo",
    "price": "1290",
    "description": "Espinaca fresca, rica en hierro, calcio y vitaminas. Perfecta para ensaladas, smoothies y guisos.",
    "tags": "espinaca,verduras,verde,hojas",
    "calories": "23",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286990-900-900",
    "shopId": VERDULERIA_ID
  },
  {
    "name": "Cebolla Morada 1 kg",
    "price": "1490",
    "description": "Cebolla morada dulce y crujiente, aporta sabor y color a tus preparaciones. Fuente de antioxidantes.",
    "tags": "cebolla,verduras,morada,sabor",
    "calories": "40",
    "stock": "190",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286991-900-900",
    "shopId": VERDULERIA_ID
  }
];

// Productos para ElectroMundo Coquimbo
const electromundoProducts = [
  {
    "name": "Smart TV Samsung 43'' 4K UHD",
    "price": "299990",
    "description": "Televisor inteligente Samsung de 43 pulgadas con resolución 4K Ultra HD. Sistema operativo Tizen, HDR y conectividad Wi-Fi.",
    "tags": "televisor,samsung,4k,smart,entretenimiento",
    "calories": "0",
    "stock": "15",
    "images": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Refrigerador No Frost 300L",
    "price": "349990",
    "description": "Refrigerador No Frost de 300 litros, eficiencia energética A+. Ideal para familias medianas con tecnología de enfriamiento uniforme.",
    "tags": "refrigerador,nofrost,electrodomestico,cocina,hogar",
    "calories": "0",
    "stock": "8",
    "images": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Laptop HP Pavilion 15.6'' Core i5",
    "price": "499990",
    "description": "Laptop HP Pavilion con procesador Intel Core i5, 8GB RAM, 256GB SSD. Perfecta para trabajo y estudio.",
    "tags": "laptop,hp,computador,trabajo,estudio",
    "calories": "0",
    "stock": "12",
    "images": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Lavadora Automática 7kg",
    "price": "259990",
    "description": "Lavadora automática de 7kg de capacidad, 12 programas de lavado. Eficiencia energética A++ y bajo consumo de agua.",
    "tags": "lavadora,automatica,electrodomestico,hogar,lavado",
    "calories": "0",
    "stock": "6",
    "images": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Microondas 20L Digital",
    "price": "89990",
    "description": "Microondas digital de 20 litros con múltiples funciones de cocción. Panel táctil y grill incorporado.",
    "tags": "microondas,digital,cocina,electrodomestico,hogar",
    "calories": "0",
    "stock": "20",
    "images": "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Smartphone Android 128GB",
    "price": "179990",
    "description": "Smartphone Android con 128GB de almacenamiento, cámara triple, pantalla 6.1'' y batería de larga duración.",
    "tags": "smartphone,android,telefono,celular,tecnologia",
    "calories": "0",
    "stock": "25",
    "images": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Aspiradora Vertical Sin Cable",
    "price": "129990",
    "description": "Aspiradora vertical inalámbrica con batería de larga duración. Filtros HEPA y múltiples accesorios para limpieza completa.",
    "tags": "aspiradora,vertical,inalambrica,limpieza,hogar",
    "calories": "0",
    "stock": "18",
    "images": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  },
  {
    "name": "Aire Acondicionado Split 12000 BTU",
    "price": "329990",
    "description": "Aire acondicionado split de 12000 BTU, función calor/frío, control remoto y temporizador programable.",
    "tags": "aire,acondicionado,split,climatizacion,hogar",
    "calories": "0",
    "stock": "10",
    "images": "https://images.unsplash.com/photo-1571175351169-1a68cfd59e7d?w=400&h=400&fit=crop&crop=center",
    "shopId": ELECTROMUNDO_ID
  }
];

// Productos para Farmacia Vicuña
const farmaciaProducts = [
  {
    "name": "Paracetamol 500mg x 20 tabletas",
    "price": "2990",
    "description": "Analgésico y antipirético para alivio de dolores leves a moderados y reducción de fiebre. Presentación de 20 tabletas.",
    "tags": "paracetamol,analgésico,medicamento,dolor,fiebre",
    "calories": "0",
    "stock": "150",
    "images": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Vitamina C 1000mg x 30 cápsulas",
    "price": "8990",
    "description": "Suplemento vitamínico con vitamina C para fortalecer el sistema inmunológico. 30 cápsulas de liberación prolongada.",
    "tags": "vitamina,c,suplemento,inmunidad,salud",
    "calories": "0",
    "stock": "80",
    "images": "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Protector Solar SPF 50+ 120ml",
    "price": "12990",
    "description": "Protector solar de amplio espectro SPF 50+, resistente al agua. Ideal para protección diaria contra rayos UV.",
    "tags": "protector,solar,spf,proteccion,piel",
    "calories": "0",
    "stock": "60",
    "images": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Alcohol Gel Antibacterial 250ml",
    "price": "3490",
    "description": "Gel antibacterial con 70% de alcohol para desinfección de manos. Fórmula con aloe vera para suavidad.",
    "tags": "alcohol,gel,antibacterial,higiene,desinfeccion",
    "calories": "0",
    "stock": "200",
    "images": "https://images.unsplash.com/photo-1584435364829-24e460a631b8?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Ibuprofeno 400mg x 10 cápsulas",
    "price": "4990",
    "description": "Antiinflamatorio no esteroidal para dolor, inflamación y fiebre. Presentación de 10 cápsulas blandas.",
    "tags": "ibuprofeno,antiinflamatorio,medicamento,dolor,inflamacion",
    "calories": "0",
    "stock": "120",
    "images": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Crema Hidratante Facial 50ml",
    "price": "15990",
    "description": "Crema hidratante facial con ácido hialurónico y ceramidas. Para todo tipo de piel, uso diario día y noche.",
    "tags": "crema,hidratante,facial,cuidado,piel",
    "calories": "0",
    "stock": "45",
    "images": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Multivitamínico Adulto x 60 tabletas",
    "price": "18990",
    "description": "Complejo multivitamínico y mineral para adultos. 60 tabletas con vitaminas A, C, D, E, complejo B y minerales esenciales.",
    "tags": "multivitaminico,vitaminas,minerales,suplemento,salud",
    "calories": "0",
    "stock": "70",
    "images": "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Termómetro Digital Infrarrojo",
    "price": "29990",
    "description": "Termómetro digital sin contacto con tecnología infrarroja. Medición rápida y precisa, pantalla LCD grande.",
    "tags": "termometro,digital,infrarrojo,temperatura,salud",
    "calories": "0",
    "stock": "25",
    "images": "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Máscara Quirúrgica x 50 unidades",
    "price": "8990",
    "description": "Caja de 50 máscaras quirúrgicas desechables de 3 capas. Protección contra partículas y fluidos.",
    "tags": "mascara,quirurgica,proteccion,desechable,higiene",
    "calories": "0",
    "stock": "100",
    "images": "https://images.unsplash.com/photo-1584483720347-d29d6f47b209?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  },
  {
    "name": "Omega 3 1000mg x 60 cápsulas",
    "price": "22990",
    "description": "Suplemento de Omega 3 con EPA y DHA para salud cardiovascular y cerebral. 60 cápsulas blandas de aceite de pescado.",
    "tags": "omega,3,suplemento,cardiovascular,cerebral",
    "calories": "0",
    "stock": "55",
    "images": "https://images.unsplash.com/photo-1550572017-edd951aa8ca0?w=400&h=400&fit=crop&crop=center",
    "shopId": FARMACIA_ID
  }
];

// Combinar todos los productos
const allRawProducts = [
  ...verduleriaProducts,
  ...electromundoProducts, 
  ...farmaciaProducts
];

export const products = allRawProducts.map(p => {
  const slug = p.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, ''); 

  return {
    name: p.name,
    price: Number(p.price),
    description: p.description,
    tags: p.tags.split(',').map(t => t.trim()),
    calories: Number(p.calories),
    stock: Number(p.stock),
    slug,
    images: [p.images], // Array de strings
    shopId: p.shopId
  };
});
