import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import ItemListContainer from './components/ItemListContainer/ItemListContainer';
import ItemDetailContainer from './components/ItemDetailContainer/ItemDetailContainer';
import Cart from './components/Cart/Cart';
import CheckoutForm from './components/CheckOutForm/CheckOutForm';
import Citas from './components/Cita/Cita';
import Hotel from './components/Hotel/Hotel';
import NotFound from './components/NotFound/NotFound';

import Login from './components/Login/Login';
import Register from './components/Register/Register';

import { useEffect } from 'react';
import { seedDatabase } from './firebase/seeder';
function App() {
  useEffect(() => { seedDatabase(); }, []);
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={<ItemListContainer />} />
            <Route path="/category/:categoryId" element={<ItemListContainer />} />
            <Route path="/item/:id" element={<ItemDetailContainer />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckoutForm />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/hotel" element={<Hotel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss={false} pauseOnHover theme="light" />
    </>
  );
}

export default App;
