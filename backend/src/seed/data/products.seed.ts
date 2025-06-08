import { Types } from "mongoose";

const rawProducts = [
  {
    "name": "Lechuga Costina 1 un.",
    "price": "1390",
    "description": "Lechuga fresca cultivada en los valles de la Región de Coquimbo. Rica en vitaminas y minerales, ideal para ensaladas veraniegas.",
    "tags": "lechuga,verduras,hortaliza,verde,coquimbo",
    "calories": "13",
    "stock": "300",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286982-900-900"
  },
  {
    "name": "Tomate Cherry 250 g",
    "price": "1990",
    "description": "Tomates cherry dulces cultivados en los valles de La Serena. Ricos en licopeno y perfectos para ensaladas.",
    "tags": "tomate,verduras,fruta,rojo,laserena",
    "calories": "18",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286983-900-900"
  },
  {
    "name": "Palta Hass 1 un.",
    "price": "890",
    "description": "Paltas Hass premium de la Región de Coquimbo. Cremosas y nutritivas, perfectas para el desayuno chileno.",
    "tags": "palta,aguacate,verde,cremoso,coquimbo",
    "calories": "160",
    "stock": "180",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286984-900-900"
  },
  {
    "name": "Limón Sutil 1 kg",
    "price": "1200",
    "description": "Limones sutil frescos del valle de Elqui. Ideales para piscos sour y aliños. Cultivados bajo el sol del norte de Chile.",
    "tags": "limon,citrico,amarillo,elqui,pisco",
    "calories": "29",
    "stock": "250",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286985-900-900"
  },
  {
    "name": "Cebolla Blanca 1 kg",
    "price": "950",
    "description": "Cebollas blancas frescas de los campos de Coquimbo. Suaves y aromáticas, esenciales en la cocina chilena.",
    "tags": "cebolla,verduras,blanco,condimento",
    "calories": "40",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286986-900-900"
  },  {
    "name": "Uvas Moscatel 1 kg",
    "price": "2890",
    "description": "Uvas moscatel dulces del famoso valle de Elqui. Perfectas para consumo fresco o para preparar jugos naturales.",
    "tags": "uvas,fruta,dulce,elqui,moscatel",
    "calories": "69",
    "stock": "150",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286987-900-900"
  },
  {
    "name": "Pimentón Rojo 1 un.",
    "price": "1590",
    "description": "Pimentón rojo dulce, rico en vitamina C y antioxidantes. Añade color y sabor a tus ensaladas y salteados.",
    "tags": "pimentón,verduras,rojo,saludable",
    "calories": "31",
    "stock": "140",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286988-900-900"
  },
  {
    "name": "Brócoli 500 g",
    "price": "2190",
    "description": "Brócoli fresco, fuente de vitaminas K y C, fibra y fitonutrientes. Ideal al vapor o salteado.",
    "tags": "brócoli,verduras,verde,nutritivo",
    "calories": "34",
    "stock": "160",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286989-900-900"
  },
  {
    "name": "Espinaca Manojo",
    "price": "1290",
    "description": "Espinaca fresca, rica en hierro, calcio y vitaminas. Perfecta para ensaladas, smoothies y guisos.",
    "tags": "espinaca,verduras,verde,hojas",
    "calories": "23",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286990-900-900"
  },
  {
    "name": "Cebolla Morada 1 kg",
    "price": "1490",
    "description": "Cebolla morada dulce y crujiente, aporta sabor y color a tus preparaciones. Fuente de antioxidantes.",
    "tags": "cebolla,verduras,morada,sabor",
    "calories": "40",
    "stock": "190",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286991-900-900"
  },
  {
    "name": "Ajo Cabeza 100 g",
    "price": "990",
    "description": "Cabeza de ajo fresco, conocido por sus propiedades antimicrobianas y antioxidantes. Imprescindible en la cocina.",
    "tags": "ajo,condimento,salud,antioxidante",
    "calories": "149",
    "stock": "300",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286992-900-900"
  },
  {
    "name": "Papa Blanca 1 kg",
    "price": "1190",
    "description": "Papas blancas versátiles, fuente de carbohidratos complejos y vitamina C. Perfectas para puré, guisos y fritas.",
    "tags": "papa,verduras,energía,carbohidratos",
    "calories": "77",
    "stock": "230",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286993-900-900"
  },
  {
    "name": "Choclo Desgranado 500 g",
    "price": "1790",
    "description": "Choclo desgranado dulce y tierno. Rico en fibra y antioxidantes. Ideal para ensaladas y acompañamientos.",
    "tags": "choclo,verduras,maíz,amarillo",
    "calories": "86",
    "stock": "210",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286994-900-900"
  },
  {
    "name": "Berenjena 1 un.",
    "price": "1590",
    "description": "Berenjena fresca, baja en calorías y rica en fibra. Perfecta para asar, hornear o guisos mediterráneos.",
    "tags": "berenjena,verduras,morada,fibra",
    "calories": "25",
    "stock": "170",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286995-900-900"
  },
  {
    "name": "Aguacate Hass 1 un.",
    "price": "2990",
    "description": "Aguacate cremoso y nutritivo, fuente de grasas saludables, fibra y vitaminas. Ideal para tostadas y ensaladas.",
    "tags": "aguacate,fruta,grasassaludables,verde",
    "calories": "160",
    "stock": "130",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286996-900-900"
  },
  {
    "name": "Zapallo Italiano 1 un.",
    "price": "1290",
    "description": "Zapallo italiano tierno, bajo en calorías y versátil. Perfecto para salteados, sopas y guisos.",
    "tags": "zapallo,verduras,verde,bajoencalorías",
    "calories": "17",
    "stock": "180",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286997-900-900"
  },
  {
    "name": "Arándanos 125 g",
    "price": "2490",
    "description": "Arándanos frescos, ricos en antioxidantes y vitamina C. Ideales para smoothies, postres o comer al natural.",
    "tags": "arándanos,fruta,antioxidantes,azul",
    "calories": "57",
    "stock": "140",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286998-900-900"
  },
  {
    "name": "Frutillas 250 g",
    "price": "2190",
    "description": "Frutillas dulces y jugosas, fuente de vitamina C y antioxidantes. Perfectas para postres y snacks.",
    "tags": "frutillas,fruta,rojo,dulce",
    "calories": "32",
    "stock": "160",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/286999-900-900"
  },
  {
    "name": "Rúcula 100 g",
    "price": "1390",
    "description": "Rúcula fresca, sabor picante y amargo. Rica en vitaminas A, C y K. Ideal para ensaladas gourmet.",
    "tags": "rúcula,verduras,verde,hojas",
    "calories": "25",
    "stock": "200",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/287000-900-900"
  },
  {
    "name": "Cilantro Manojo",
    "price": "1090",
    "description": "Cilantro fresco, aromático y versátil. Excelente para dar sabor a sopas, salsas y guisos latinoamericanos.",
    "tags": "cilantro,verduras,verde,herb",
    "calories": "23",
    "stock": "220",
    "images": "https://santaisabel.vtexassets.com/arquivos/ids/287001-900-900"
  }
];

export const products = rawProducts.map(p => {
  const slug = p.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/\s+/g, '-') // reemplaza espacios con guiones
    .replace(/[^\w-]+/g, ''); // elimina caracteres no alfanuméricos excepto guiones

  return {
    name: p.name,
    price: Number(p.price),
    description: p.description,
    tags: p.tags.split(',').map(t => t.trim()),
    calories: Number(p.calories),
    stock: Number(p.stock),
    slug,
    images: [
      {
        publicId: slug, // Usar el slug generado como publicId
        url: p.images
      }
    ],
    // Si necesitas añadir shopId u otros campos por defecto, puedes hacerlo aquí
    shopId: new Types.ObjectId("66523a50123a4567890abc01"), // Ejemplo
  };
});
