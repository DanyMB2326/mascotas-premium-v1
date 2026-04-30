import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="not-found">
    <div className="nf-emoji">🐾</div>
    <h1 className="nf-title">¡Esta página se escapó!</h1>
    <p className="nf-sub">La URL que buscás no existe. Pero tu manada te espera en el inicio.</p>
    <Link to="/" className="btn-primary">Volver al inicio</Link>
  </div>
);

export default NotFound;