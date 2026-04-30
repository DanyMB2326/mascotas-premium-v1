const Loader = ({ text = 'Cargando...' }) => (
  <div className="loader-wrapper">
    <div className="loader-ring" />
    <p className="loader-text">{text}</p>
  </div>
);

export default Loader;