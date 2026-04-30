import { useState } from 'react';
import './ItemCount.css';

const ItemCount = ({ stock, initial = 1, onAdd }) => {
  const [count, setCount] = useState(initial);

  const decrement = () => setCount((c) => Math.max(1, c - 1));
  const increment = () => setCount((c) => Math.min(stock, c + 1));

  const handleAdd = () => {
    if (count >= 1 && count <= stock) {
      onAdd(count);
    }
  };

  return (
    <div className="item-count">
      <div className="count-controls">
        <button
          className="count-btn"
          onClick={decrement}
          disabled={count <= 1}
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="count-value">{count}</span>
        <button
          className="count-btn"
          onClick={increment}
          disabled={count >= stock}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <button className="btn-primary count-add-btn" onClick={handleAdd}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        ✨ Agregar al carrito
      </button>
    </div>
  );
};

export default ItemCount;