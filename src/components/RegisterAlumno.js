import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RegisterAlumno() {
  const [curp, setCurp] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [carrera, setCarrera] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!curp || !nombre || !password || !carrera) {
      setError("Todos los campos obligatorios deben ser llenados");
      return;
    }

    try {
      const alumnoRef = doc(db, "alumnos", curp);
      await setDoc(alumnoRef, {
        nombre,
        password,
        carrera,
        email,
        materias: [],
        talleres: [],
      });
      setSuccess("Alumno registrado exitosamente");
      setCurp("");
      setNombre("");
      setPassword("");
      setCarrera("");
      setEmail("");
    } catch (err) {
      setError("Error al registrar alumno: " + err.message);
    }
  };

  return (
    <div className="register-alumno-container">
      <h2>Registrar Alumno</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="CURP (usuario)"
          value={curp}
          onChange={(e) => setCurp(e.target.value.trim())}
          required
        />
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Número de cuenta (contraseña)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Carrera"
          value={carrera}
          onChange={(e) => setCarrera(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Registrar Alumno</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button onClick={() => navigate("/admin")}>Volver al Panel de Admin</button>
    </div>
  );
}
