import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './config';

const mockProducts = [

  // ── NUTRICIÓN PREMIUM ──────────────────────────────────────────────────────
  {
    title: 'Bowl Fresco Pollo & Camote',
    category: 'nutricion',
    price: 180,
    stock: 50,
    description: 'Comida fresca cocida artesanalmente con pollo de granja, camote, zanahoria y aceite de salmón. Sin conservadores. Porción para perro mediano (1 día). Formulada por veterinaria nutrióloga.',
    image: '/img/nutricion-bowl-pollo.jpg',
  },
  {
    title: 'Bowl Fresco Salmón & Arroz',
    category: 'nutricion',
    price: 210,
    stock: 40,
    description: 'Receta premium de salmón salvaje con arroz integral, espinacas y cúrcuma antiinflamatoria. Ideal para perros con sensibilidad digestiva. Porción diaria para perro mediano.',
    image: '/img/nutricion-bowl-salmon.jpg',
  },
  {
    title: 'Snacks Dentales Menta & Coco',
    category: 'nutricion',
    price: 120,
    stock: 80,
    description: 'Premios masticables con aceite de coco, menta y aloe vera. Limpian los dientes mientras premias a tu perro. Sin azúcar, sin gluten. Bolsa de 200g.',
    image: '/img/nutricion-snacks-dental.jpg',
  },
  {
    title: 'Comida Seca Holística Adulto',
    category: 'nutricion',
    price: 480,
    stock: 30,
    description: 'Croquetas premium grain-free con proteína de res, batata, arándanos y probióticos. Para perros adultos de todas las razas. Bolsa 2kg. Certificada por SENASICA.',
    image: '/img/nutricion-croquetas.jpg',
  },
  {
    title: 'Gelato para Perros',
    category: 'nutricion',
    price: 85,
    stock: 60,
    description: 'Helado artesanal sin lactosa en sabores: mantequilla de maní, fresa y plátano. Ingredientes 100% naturales. Presentación individual. Perfecto para días calurosos.',
    image: '/img/nutricion-gelato.jpg',
  },

  // ── BIENESTAR & SALUD ──────────────────────────────────────────────────────
  {
    title: 'Suplemento Articulaciones Senior',
    category: 'bienestar',
    price: 320,
    stock: 35,
    description: 'Fórmula con glucosamina, condroitina, MSM y omega-3 para perros y gatos mayores de 7 años. Mejora movilidad y reduce inflamación. 60 tabletas masticables sabor pollo.',
    image: '/img/bienestar-articulaciones.jpg',
  },
  {
    title: 'Aceite CBD Calma & Relajación',
    category: 'bienestar',
    price: 450,
    stock: 25,
    description: 'Aceite de CBD de espectro completo para reducir ansiedad, miedos y estrés en perros y gatos. Sin psicoactivos. 30ml con dosificador. Avalado por veterinarios.',
    image: '/img/bienestar-cbd.jpg',
  },
  {
    title: 'Kit Grooming Premium',
    category: 'bienestar',
    price: 380,
    stock: 20,
    description: 'Set completo de higiene: shampoo con avena y manzanilla, acondicionador desrizante, perfume de larga duración y cepillo de bambú. Para perros y gatos de pelo largo.',
    image: '/img/bienestar-grooming.jpg',
  },
  {
    title: 'Pasta Dental + Cepillo Bambú',
    category: 'bienestar',
    price: 145,
    stock: 55,
    description: 'Pasta dental enzimática sabor pollo con cepillo de bambú ergonómico. Previene sarro, mal aliento y enfermedades periodontales. Para perros y gatos. Sin fluoruro.',
    image: '/img/bienestar-dental.jpg',
  },

  // ── ACCESORIOS & MODA ─────────────────────────────────────────────────────
  {
    title: 'Collar Artesanal Macramé',
    category: 'accesorios',
    price: 280,
    stock: 30,
    description: 'Collar trenzado a mano con hilo de algodón orgánico, herrajes de acero inoxidable y argolla personalizable. Ajustable. Disponible en 6 colores. Tallas XS a XL.',
    image: '/img/accesorios-collar.jpg',
  },
  {
    title: 'Cama Ortopédica Memory Foam',
    category: 'accesorios',
    price: 850,
    stock: 15,
    description: 'Cama con espuma viscoelástica de alta densidad que alivia articulaciones y mejora el descanso. Funda removible lavable en máquina. Diseño escandinavo. Talla M (60x80cm).',
    image: '/img/accesorios-cama.jpg',
  },
  {
    title: 'Mochila Transportadora Chic',
    category: 'accesorios',
    price: 650,
    stock: 18,
    description: 'Mochila de lona premium para transportar mascotas hasta 6kg. Ventanas de malla, base acolchada, correas regulables y asa lateral. Aprobada para cabina de avión.',
    image: '/img/accesorios-mochila.jpg',
  },
  {
    title: 'Bandana Personalizada',
    category: 'accesorios',
    price: 95,
    stock: 70,
    description: 'Bandana de tela de algodón estampado bordada con el nombre de tu mascota. Hecha a mano por artesanas mexicanas. Cierre ajustable. Disponible en 12 estampados.',
    image: '/img/accesorios-bandana.jpg',
  },

  // ── CAJA MANADA (SUSCRIPCIÓN) ──────────────────────────────────────────────
  {
    title: 'Caja Manada Básica',
    category: 'suscripcion',
    price: 350,
    stock: 100,
    description: 'Tu primer mes en la manada. Incluye: 2 porciones de comida fresca, 1 bolsa de snacks, 1 accesorio sorpresa y tarjeta de bienvenida personalizada. Envío incluido. ¡Cancelá cuando quieras!',
    image: '/img/suscripcion-basica.jpg',
  },
  {
    title: 'Caja Manada Premium',
    category: 'suscripcion',
    price: 650,
    stock: 80,
    description: 'La experiencia completa. Incluye: 5 porciones de comida fresca, snacks gourmet, 1 suplemento, 2 accesorios exclusivos y acceso a nuestra comunidad privada. El favorito de nuestra manada. Envío gratis.',
    image: '/img/suscripcion-premium.jpg',
  },
  {
    title: 'Caja Manada Bienestar',
    category: 'suscripcion',
    price: 520,
    stock: 60,
    description: 'Enfocada 100% en salud. Incluye: suplementos del mes, kit de higiene, snacks funcionales y guía veterinaria personalizada según la edad y raza de tu mascota. Envío gratis.',
    image: '/img/suscripcion-bienestar.jpg',
  },
  {
    title: 'Caja Manada Gatuna',
    category: 'suscripcion',
    price: 420,
    stock: 70,
    description: 'Diseñada especialmente para gatos. Incluye: comida húmeda premium, snacks de atún, juguete interactivo, colonia relajante y arena aglomerante mini. Novedad cada mes.',
    image: '/img/suscripcion-gatuna.jpg',
  },
];

export const seedDatabase = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (!snapshot.empty) return;
    for (const product of mockProducts) {
      await addDoc(productsRef, product);
    }
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  }
};