import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "../styles/prerregistro.css";

export default function PreRegistro() {
  const location = useLocation();
  const navigate = useNavigate();

  const carreraSeleccionada = location.state?.carrera || "";

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [escuela, setEscuela] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const validarEmail = (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  };

  const validarTelefono = (telefono) => {
    // Validar solo números, entre 7 y 15 dígitos, permite espacios o guiones opcionales
    const regexTel = /^[0-9\s\-]{7,15}$/;
    return regexTel.test(telefono);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    // Validar campos obligatorios
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !localidad.trim() || !escuela.trim()) {
      setError("Por favor llena todos los campos.");
      return;
    }

    if (!validarEmail(email)) {
      setError("El correo electrónico no es válido.");
      return;
    }

    if (!validarTelefono(telefono)) {
      setError("El teléfono debe contener solo números y tener entre 7 y 15 dígitos.");
      return;
    }

    try {
      await addDoc(collection(db, "preregistros"), {
        nombre,
        email,
        telefono,
        localidad,
        escuela,
        carrera: carreraSeleccionada,
        fecha: new Date()
      });
      setExito("Pre-registro enviado correctamente.");
      setNombre("");
      setEmail("");
      setTelefono("");
      setLocalidad("");
      setEscuela("");
    } catch (err) {
      setError("Error al enviar el pre-registro. Intenta de nuevo.");
    }
  };

  return (
    <div className="preregistro-container">
      <h2>Pre-registro: {carreraSeleccionada}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Localidad"
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Escuela actual"
          value={escuela}
          onChange={(e) => setEscuela(e.target.value)}
          required
        />
        <button type="submit">Enviar Pre-registro</button>
      </form>

      {error && <p className="error">{error}</p>}
      {exito && <p className="success">{exito}</p>}

      <button onClick={() => navigate(-1)} className="btn-back">
        Regresar
      </button>
    </div>
  );
}
