import './Logo.css';

/**
 * Logo SVG inspirado en el isotipo de Paw Loyal:
 * silueta de perro y gato abrazando una cruz médica con un hueso dorado.
 */
const Logo = ({ size = 48, withText = false, light = false }) => {
  const stroke = light ? '#FAF6EC' : '#2C8A8A';
  const navy   = light ? '#FAF6EC' : '#1F3A5F';
  const gold   = '#F4C430';

  return (
    <span className={`brand-logo ${light ? 'brand-logo--light' : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Paw Loyal"
        role="img"
      >
        {/* Silueta perro */}
        <path
          d="M22 32 C18 22, 30 12, 40 18 C46 22, 48 28, 50 36 C50 46, 46 56, 38 60 C28 64, 16 56, 18 44 Z"
          fill="none" stroke={stroke} strokeWidth="3.2" strokeLinejoin="round"
        />
        {/* Oreja perro */}
        <path d="M28 18 C24 12, 30 6, 36 12" fill="none" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
        {/* Silueta gato */}
        <path
          d="M70 38 C76 30, 86 32, 86 44 C86 54, 80 64, 70 64 C60 64, 54 56, 56 46 C58 38, 64 36, 70 38 Z"
          fill="none" stroke={stroke} strokeWidth="3.2" strokeLinejoin="round"
        />
        {/* Orejas gato */}
        <path d="M62 36 L60 28 L67 33 Z M77 34 L80 27 L82 35 Z" fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
        {/* Cruz médica */}
        <rect x="42" y="58" width="16" height="22" rx="2" fill="none" stroke={navy} strokeWidth="3" />
        <rect x="35" y="65" width="30" height="8"  rx="2" fill="none" stroke={navy} strokeWidth="3" />
        {/* Hueso dorado */}
        <path
          d="M44 67 c-2 0 -3 2 -2 3 c -1 1 0 3 2 3 l 12 0 c 2 0 3 -2 2 -3 c 1 -1 0 -3 -2 -3 z"
          fill={gold} stroke={navy} strokeWidth="1.4"
        />
      </svg>

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