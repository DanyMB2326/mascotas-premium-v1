import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useFirestore';
import ItemDetail from '../ItemDetail/ItemDetail';
import Loader from '../Loader/Loader';

const ItemDetailContainer = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

  if (loading) return <Loader text="Preparando la magia..." />;

  if (error) {
    return (
      <div className="state-container">
        <span className="state-icon">🔍</span>
        <h2>🔍 Producto no encontrado</h2>
        <p>{error}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '0.5rem' }}>
          ← Volver al reino
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return <ItemDetail {...product} />;
};

export default ItemDetailContainer;

