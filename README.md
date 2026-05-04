# 🐾 Paw Loyal — Clínica Boutique Animal

> Plataforma web para servicios de cuidado y bienestar animal en CDMX.  
> **[pawloyal.netlify.app](https://paw-loyal.netlify.app/)**

---

## ✨ Descripción

**Paw Loyal** es una clínica boutique animal que ofrece estética, spa, hospedaje, adiestramiento y transporte para perros y gatos en la Ciudad de México. Esta plataforma web permite a los *pet parents* conocer los servicios, reservar citas, comprar productos premium y gestionar el perfil de sus mascotas, todo en un solo lugar.

---

## 🚀 Demo en vivo

🔗 **[https://paw-loyal.netlify.app/](https://paw-loyal.netlify.app/)**

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth |
| Estilos | CSS Modules (vanilla) |
| Notificaciones | React Toastify |
| Deploy | Netlify |

---

## 📦 Funcionalidades

### 🐶 Para el usuario
- **Inicio de sesión / Registro** con Firebase Auth
- **Perfil unificado** con 5 secciones:
  - Mis mascotas (agregar, editar, eliminar)
  - Historial de reservas y compras
  - Mi información de contacto
  - Gestión de direcciones de entrega
  - Métodos de pago guardados
- **Reservación de servicios** con autocompletado desde el perfil
- **Tienda en línea** con filtros por categoría y marca, carrito y checkout con envío a domicilio
- **Simulación de pago** con tarjeta de crédito/débito

### 🏪 Servicios
| Servicio | Descripción |
|---|---|
| ✂️ Estética | Cortes a tijera y máquina por raza |
| 🛁 Baño premium | Shampoo dermatológico y acabado profesional |
| 🌿 Spa | Hidromasaje, ozonoterapia y aromaterapia |
| ☀️ Guardería | Jornada media o completa |
| 🏨 Pensión | Hospedaje 24/7 con atención veterinaria |
| 🎓 Adiestramiento | Refuerzo positivo: obediencia y socialización |
| 🚐 Transporte | Recolección y entrega en vehículos climatizados |
| 📦 Paquetes | Suscripciones mensuales Essential, Premium y VIP |

### 🛍️ Tienda
- Productos de **Royal Canin, Hill's, Purina Pro Plan y Dog Chow**
- Categorías: alimentos, juguetes, camas y accesorios
- Carrito persistente durante la sesión
- Checkout con envío gratis a partir de $700 MXN

---

## 🗂️ Estructura del proyecto

```
src/
├── components/
│   ├── NavBar/
│   ├── Home/
│   ├── Nosotros/
│   ├── Servicios/
│   ├── ServiceDetail/
│   ├── Reservar/
│   ├── Tienda/
│   ├── ProductDetail/
│   ├── Cart/
│   ├── Checkout/
│   ├── MiPerfil/
│   ├── AvisoPrivacidad/
│   ├── TerminosCondiciones/
│   ├── Proveedores/
│   └── Footer/
├── context/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── UserProfileContext.jsx
├── data/
│   ├── services.js
│   └── products.js
└── firebase/
    └── config.js
```

---

## ⚙️ Instalación y uso local

```bash
# Clonar el repositorio
git clone https://github.com/DanyMB2326/mascotas-premium.git
cd mascotas-premium

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
# → Agregar las credenciales de Firebase

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
```

### Variables de entorno requeridas

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🔥 Configuración de Firebase

### Firestore Rules

Las reglas de seguridad están en `firestore.rules`. Aplicar con:

```bash
firebase deploy --only firestore:rules
```

### Colecciones utilizadas

| Colección | Contenido |
|---|---|
| `users/{uid}` | Mascotas del usuario |
| `users/{uid}/profile/data` | Información, direcciones y tarjetas |
| `reservas` | Reservas de servicios |
| `pedidos` | Compras de la tienda |

---

## 🎨 Paleta de colores

| Color | Hex | Uso |
|---|---|---|
| Teal | `#2C8A8A` | Acento principal |
| Navy | `#1F3A5F` | Fondo oscuro / CTA |
| Gold | `#F4C430` | Destacados |
| Brown | `#6B5544` | Tipografía display |
| Cream | `#FAF6EC` | Fondo base |

---

## 📄 Páginas y rutas

| Ruta | Componente |
|---|---|
| `/` | Home |
| `/nosotros` | Nosotros |
| `/servicios` | Catálogo de servicios |
| `/servicios/:id` | Detalle de servicio |
| `/reservar` | Formulario de reserva |
| `/tienda` | Tienda de productos |
| `/tienda/:id` | Detalle de producto |
| `/cart` | Carrito |
| `/checkout` | Finalizar compra |
| `/perfil` | Perfil del usuario (protegida) |
| `/aviso-privacidad` | Aviso de privacidad (LFPDPPP) |
| `/terminos` | Términos y condiciones |

---

## 📋 Legal

- **Aviso de privacidad** conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)
- **Términos y condiciones** del servicio con políticas de cancelación y responsabilidades
- Solo se almacenan los últimos 4 dígitos de tarjetas — nunca el número completo

---

## 👩‍💻 Desarrollado por

**Daniela Martínez Bravo**  
Ingeniería en Computación · UNAM  
[GitHub @DanyMB2326](https://github.com/DanyMB2326)

---

<div align="center">
  <p>Hecho con 🐾 para las familias que aman a sus mascotas · CDMX 2026</p>
  <a href="https://paw-loyal.netlify.app/">paw-loyal.netlify.app</a>
</div>
