import Item from '../Item/Item';
import './ItemList.css';

const ItemList = ({ products }) => {
  return (
    <div className="item-list">
      {products.map((product, index) => (
        <div
          key={product.id}
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <Item {...product} />
        </div>
      ))}
    </div>
  );
};

export default ItemList;
