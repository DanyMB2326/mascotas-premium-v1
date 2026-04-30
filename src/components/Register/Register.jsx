import { useState } from "react";
import "./Register.css";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";

import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nombre,
        email
      });

      alert("Usuario registrado con éxito");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>

        <form className="register-form" onSubmit={handleRegister}>
          <input
            className="register-input"
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            className="register-input"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="register-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />


          <input
            className="register-input"
            type="password"
            placeholder="Confirma tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="register-btn" type="submit">
            Registrarme
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;