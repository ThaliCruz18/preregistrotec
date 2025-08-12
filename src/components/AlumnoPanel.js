// src/components/AlumnoPanel.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/alumnoPanel.css";

export default function AlumnoPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const alumno = location.state?.alumno;

  const [talleresInscritos, setTalleresInscritos] = useState(alumno?.talleres || []);
  const [nuevoTaller, setNuevoTaller] = useState("");

  // Redirigir a login si no hay alumno en el estado
  useEffect(() => {
    if (!alumno) {
      navigate("/login");
    }
  }, [alumno, navigate]);

  const handleAgregarTaller = () => {
    const tallerTrim = nuevoTaller.trim();
    if (tallerTrim && !talleresInscritos.includes(tallerTrim)) {
      setTalleresInscritos([...talleresInscritos, tallerTrim]);
      setNuevoTaller("");
      // TODO: Aquí actualiza Firestore para guardar el nuevo taller si quieres persistencia
    }
  };

  if (!alumno) {
    return null; // Mientras redirige no muestra nada
  }

  return (
    <div className="alumno-panel-container">
      <h1>Bienvenido, {alumno.nombre}</h1>
      <p>Carrera: {alumno.carrera}</p>
      <p>Número de cuenta: {alumno.password || alumno.numeroCuenta || "No disponible"}</p>

      <h2>Materias inscritas</h2>
      <ul>
        {(alumno.materias || []).map((mat, idx) => (
          <li key={idx}>{mat}</li>
        ))}
      </ul>

      <h2>Talleres inscritos</h2>
      <ul>
        {talleresInscritos.map((taller, idx) => (
          <li key={idx}>{taller}</li>
        ))}
      </ul>

      <div className="inscribir-taller">
        <input
          type="text"
          placeholder="Nombre del taller"
          value={nuevoTaller}
          onChange={(e) => setNuevoTaller(e.target.value)}
        />
        <button onClick={handleAgregarTaller}>Inscribir Taller</button>
      </div>

      <button onClick={() => navigate("/login")}>Cerrar sesión</button>
    </div>
  );
}
