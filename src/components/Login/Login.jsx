import { useState } from "react";
import "./Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        <p className="login-subtitle">
          Accede para gestionar tus compras y reservas.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-group">
            <label className="login-label">Correo</label>
            <input
              className="login-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-group">
            <label className="login-label">Contraseña</label>
            <input
              className="login-input"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit">
            Ingresar
          </button>
        </form>

        <p className="login-extra">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="login-link">
            Regístrate
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;