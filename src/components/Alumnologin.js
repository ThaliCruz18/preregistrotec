// src/components/AlumnoLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/login.css";

export default function AlumnoLogin() {
  const [email, setEmail] = useState("");
  const [numCuenta, setNumCuenta] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !numCuenta.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      // Buscar alumno con email y número de cuenta
      const q = query(
        collection(db, "alumnos"),
        where("email", "==", email),
        where("numCuenta", "==", numCuenta)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No se encontró alumno con esos datos");
      } else {
        const alumnoData = querySnapshot.docs[0].data();
        // Navegar al panel alumno enviando datos
        navigate("/alumno-panel", { state: { alumno: alumnoData } });
      }
    } catch (err) {
      setError("Error al buscar alumno");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>Ingreso Alumnos</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Número de cuenta"
          value={numCuenta}
          onChange={(e) => setNumCuenta(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
