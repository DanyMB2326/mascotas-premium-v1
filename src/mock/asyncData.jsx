import besoFrio from '../assets/img/beso-frio.png'
import galletaComeme from '../assets/img/galleta-comeme.png'
import tazaSparrow from '../assets/img/taza-sparrow.png'

const products = [
    { id: 1, name: "Espresso de Mickey", price: 50, category: "cafes", stock: 10, img: besoFrio },
    { id: 2, name: "Donas de Minnie", price: 45, category: "pasteleria", stock: 15, img: galletaComeme },
    { id: 3, name: "Taza Coleccionable", price: 150, category: "merch", stock: 5, img: tazaSparrow }
];

export const getProducts = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(products);
        }, 500);
    });
};

/**
 * Función para obtener un solo producto por ID
 * Útil para ItemDetailContainer
 */
export const getProductById = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(products.find(p => p.id === Number(id)));
        }, 500);
    });
};