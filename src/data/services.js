/**
 * Paw Loyal — Catálogo de servicios.
 * Cada servicio define las opciones (variantes) reservables, su precio y duración.
 * Las páginas Home / ServiceDetail / Reservar consumen esta fuente única de verdad.
 */

export const SERVICES = [
  {
    id: 'estetica',
    nombre: 'Estética canina y felina',
    short: 'Cortes a tijera y máquina con técnicas profesionales para cada raza.',
    icon: 'scissors',
    emoji: '✂️',
    color: 'teal',
    hero: 'Cortes profesionales con cariño',
    descripcion:
      'Cortes de raza o de fantasía hechos por estilistas certificados. Trabajamos con máquinas low-noise, tijeras curvas y productos hipoalergénicos para que tu mascota viva una sesión tranquila y luzca espectacular.',
    incluye: [
      'Diagnóstico de pelo y piel',
      'Corte a tijera o máquina (a elección)',
      'Limado de uñas y limpieza de oídos',
      'Perfume natural sin alcohol',
      'Moño / pañuelo de regalo',
    ],
    duracion: '1.5 – 2.5 h',
    options: [
      { id: 'estetica-pequeno', label: 'Talla pequeña (hasta 10 kg)', precio: 380 },
      { id: 'estetica-mediano', label: 'Talla mediana (10–25 kg)',     precio: 520 },
      { id: 'estetica-grande',  label: 'Talla grande (25 kg+)',        precio: 720 },
      { id: 'estetica-gato',    label: 'Felino · corte sanitario',     precio: 480 },
    ],
  },
  {
    id: 'bano',
    nombre: 'Baño premium',
    short: 'Baños spa con shampoo dermatológico y acabado profesional.',
    icon: 'shower',
    emoji: '🛁',
    color: 'teal',
    hero: 'Baños que cuidan la piel',
    descripcion:
      'Baño con agua templada, shampoo y acondicionador formulados según el tipo de pelo y piel de tu mascota. Secado con soplador profesional, cepillado y perfumado de larga duración.',
    incluye: [
      'Cepillado pre-baño',
      'Shampoo + acondicionador premium',
      'Secado profesional + desenredo',
      'Limpieza de oídos',
      'Perfume y moño/pañuelo',
    ],
    duracion: '1 – 1.5 h',
    options: [
      { id: 'bano-pequeno', label: 'Talla pequeña (hasta 10 kg)', precio: 250 },
      { id: 'bano-mediano', label: 'Talla mediana (10–25 kg)',     precio: 350 },
      { id: 'bano-grande',  label: 'Talla grande (25 kg+)',        precio: 480 },
      { id: 'bano-gato',    label: 'Felino',                       precio: 320 },
    ],
  },
  {
    id: 'spa',
    nombre: 'Spa para mascotas',
    short: 'Tratamientos relajantes: hidromasaje, ozonoterapia y aromaterapia.',
    icon: 'sparkles',
    emoji: '🌿',
    color: 'gold',
    hero: 'Bienestar de pies a cola',
    descripcion:
      'Una experiencia de spa completa para tu mejor amigo. Combinamos hidromasaje con sales relajantes, ozonoterapia para piel sensible, mascarilla nutritiva y aromaterapia con esencias seguras para mascotas.',
    incluye: [
      'Hidromasaje con sales minerales',
      'Ozonoterapia + mascarilla nutritiva',
      'Aromaterapia relajante',
      'Masaje terapéutico de 15 min',
      'Hidratación profunda del pelaje',
    ],
    duracion: '2 – 3 h',
    options: [
      { id: 'spa-relax',     label: 'Spa Relax',                precio: 650 },
      { id: 'spa-completo',  label: 'Spa Completo + masaje',    precio: 850 },
      { id: 'spa-piel',      label: 'Spa Piel sensible',        precio: 920 },
    ],
  },
  {
    id: 'guarderia',
    nombre: 'Guardería',
    short: 'Día de juego, socialización y descanso supervisado.',
    icon: 'sun',
    emoji: '☀️',
    color: 'gold',
    hero: 'Un día divertido mientras trabajas',
    descripcion:
      'Tu peludo pasa el día en áreas amplias, separadas por talla y temperamento. Personal capacitado supervisa juegos, siestas y comidas. Recibís reportes con fotos por WhatsApp.',
    incluye: [
      'Horario flexible 8:00 – 19:00',
      'Áreas separadas por tamaño',
      'Sesiones de juego guiadas',
      'Reporte fotográfico diario',
      'Seguro veterinario incluido',
    ],
    duracion: 'Por jornada',
    options: [
      { id: 'guarderia-medio',   label: 'Media jornada (hasta 5 h)',     precio: 280 },
      { id: 'guarderia-completo',label: 'Jornada completa (hasta 11 h)', precio: 450 },
      { id: 'guarderia-bono10',  label: 'Bono 10 días',                  precio: 3800 },
    ],
  },
  {
    id: 'pension',
    nombre: 'Pensión',
    short: 'Hospedaje 24/7 con suites cómodas y atención veterinaria.',
    icon: 'bed',
    emoji: '🏨',
    color: 'navy',
    hero: 'Vacaciones sin culpa',
    descripcion:
      'Suites individuales o compartidas con cama ortopédica, climatización y cámara en vivo. Personal dedicado las 24 horas y atención veterinaria de emergencia siempre disponible.',
    incluye: [
      'Suite climatizada con cama ortopédica',
      'Cámara en vivo 24/7',
      'Paseos y juegos diarios',
      'Reporte por WhatsApp',
      'Atención veterinaria de emergencia',
    ],
    duracion: 'Por noche',
    options: [
      { id: 'pension-basica',  label: 'Suite Básica',         precio: 350 },
      { id: 'pension-premium', label: 'Suite Premium',        precio: 580 },
      { id: 'pension-felina',  label: 'Suite Felina',         precio: 320 },
    ],
  },
  {
    id: 'adiestramiento',
    nombre: 'Adiestramiento',
    short: 'Educación con refuerzo positivo: obediencia, modales y socialización.',
    icon: 'graduation',
    emoji: '🎓',
    color: 'navy',
    hero: 'Mejor convivencia, refuerzo positivo',
    descripcion:
      'Sesiones diseñadas por etólogos certificados. Trabajamos con refuerzo positivo, sin castigos físicos. Plan personalizado tras una evaluación inicial gratuita.',
    incluye: [
      'Evaluación etológica gratuita',
      'Plan de entrenamiento personalizado',
      'Material didáctico para casa',
      'Soporte por WhatsApp entre sesiones',
      'Reporte de avances semanal',
    ],
    duracion: '1 h por sesión',
    options: [
      { id: 'adiestramiento-individual', label: 'Sesión individual',          precio: 480 },
      { id: 'adiestramiento-pack5',      label: 'Paquete 5 sesiones',         precio: 2200 },{ id: 'adiestramiento-cachorro',   label: 'Curso cachorro (8 sesiones)',precio: 3400 },
    ],
  },
  {
    id: 'transporte',
    nombre: 'Transporte de mascotas',
    short: 'Recolección y entrega segura en vehículos climatizados.',
    icon: 'van',
    emoji: '🚐',
    color: 'gold',
    hero: 'De su casa a la nuestra, sin estrés',
    descripcion:
      'Vans acondicionadas con jaulas separadas, cinturones de seguridad y aire acondicionado. Personal entrenado en manejo conductual. Servicio puerta a puerta en CDMX y zona conurbada.',
    incluye: [
      'Recolección a domicilio',
      'Jaula individual segura',
      'Vehículo climatizado',
      'Seguro de viaje',
      'Aviso por WhatsApp en tiempo real',
    ],
    duracion: 'Tarifa por viaje',
    options: [
      { id: 'transporte-cercano',  label: 'Zona cercana (hasta 10 km)', precio: 180 },
      { id: 'transporte-medio',    label: 'Zona media (10–25 km)',      precio: 320 },
      { id: 'transporte-extendido',label: 'Zona extendida (25 km+)',    precio: 480 },
    ],
  },
  {
    id: 'paquetes',
    nombre: 'Paquetes de cuidado mensual',
    short: 'Suscripciones que combinan estética, baños y revisiones a precio preferente.',
    icon: 'package',
    emoji: '📦',
    color: 'navy',
    featured: true,
    hero: 'Cuidado integral todo el mes',
    descripcion:
      'Suscribite a un plan mensual y olvidate de coordinar. Combinamos baños, estética, revisión veterinaria y descuentos exclusivos en otros servicios. Cancelás cuando quieras.',
    incluye: [
      'Servicios programados al mejor precio',
      'Recordatorios automáticos',
      '15% de descuento en otros servicios',
      'Atención prioritaria',
      'Sin permanencia mínima',
    ],
    duracion: 'Mensual recurrente',
    options: [
      {
        id: 'paquete-essential',
        label: 'Plan Essential',
        precio: 890,
        bullets: ['2 baños premium', '1 corte de uñas', '10% off en estética'],
      },
      {
        id: 'paquete-premium',
        label: 'Plan Premium',
        precio: 1690,
        bullets: ['2 baños + 1 corte completo', '1 spa relax', '15% off en otros servicios'],
      },
      {
        id: 'paquete-vip',
        label: 'Plan VIP',
        precio: 2890,
        bullets: ['4 baños + 2 cortes', '1 spa completo + masaje', '1 día de guardería', '20% off + transporte gratis'],
      },
    ],
  },
];

export const findService = (id) => SERVICES.find((s) => s.id === id) || null;

export const findOption = (serviceId, optionId) => {
  const svc = findService(serviceId);
  return svc ? svc.options.find((o) => o.id === optionId) || null : null;
};