import '../Logo/Logo.css';
import logo from '../../assets/logo.png';

const Logo = ({ size = 48, withText = false }) => {
  return (
    <span className="brand-logo">
      <img
        src={logo}
        alt="Paw Loyal"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />

      {withText && (
        <span className="brand-text">
          <span className="brand-name">Paw Loyal</span>
          <span className="brand-sub">Clínica Boutique Animal</span>
        </span>
      )}
    </span>
  );
};

export default Logo;