import { useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useFirestore';
import ItemList from '../ItemList/ItemList';
import HeroBanner from '../Herobanner/Herobanner';
import Loader from '../Loader/Loader';
import './ItemListContainer.css';

const CATEGORY_LABELS = {
  nutricion: 'Nutrición Premium',
  bienestar: 'Bienestar & Salud',
  accesorios: 'Accesorios & Moda',
  suscripcion: 'Caja Manada',
};

const CATEGORY_SUBTITLES = {
  nutricion: 'Alimentos artesanales formulados por veterinarios nutriólogos 🥩',
  bienestar: 'Suplementos, cuidado preventivo y salud integral para tu manada 💊',
  accesorios: 'Estilo, confort y personalidad para tu compañero 🎀',
  suscripcion: 'Recibí cada mes lo mejor para tu mascota, sin salir de casa 📦',
};

const ItemListContainer = () => {
  const { categoryId } = useParams();
  const { products, loading, error } = useProducts(categoryId || null);

  const title = categoryId ? CATEGORY_LABELS[categoryId] ?? categoryId : 'Todo para tu manada';
  const subtitle = categoryId
    ? CATEGORY_SUBTITLES[categoryId] ?? `Explorá nuestra selección de ${CATEGORY_LABELS[categoryId]}`
    : 'Nutrición, bienestar, accesorios y suscripciones premium para perros y gatos.';

  return (
    <section className="item-list-container">
      {!categoryId && <HeroBanner />}

      <div className="section-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {loading && <Loader text="Cargando productos..." />}

      {error && (
        <div className="state-container">
          <span className="state-icon">⚠️</span>
          <h2>Algo salió mal</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-container">
          <span className="state-icon">🐾</span>
          <h2>Sin productos por aquí</h2>
          <p>Pronto habrá novedades en esta sección. ¡Volvé pronto!</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && <ItemList products={products} />}
    </section>
  );
};

export default ItemListContainer;