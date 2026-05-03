import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }        from './context/AuthContext';
import { CartProvider }        from './context/CartContext';
import { UserProfileProvider } from './context/UserProfileContext';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProfileProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </UserProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);