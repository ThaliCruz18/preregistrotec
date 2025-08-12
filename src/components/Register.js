// src/components/RegisterAlumno.js
import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterAlumno() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carrera, setCarrera] = useState("");
  const [numCuenta, setNumCuenta] = useState("");
  const [error, setError] = useState("");

  const handleRegisterAlumno = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar datos del alumno en Firestore con rol 'alumno'
      await setDoc(doc(db, "users", user.uid), {
        nombre,
        email,
        carrera,
        numCuenta,
        role: "alumno",
        materias: [],
        talleres: [],
      });

      alert("Alumno registrado con éxito");
      // Aquí puedes redirigir al login o directamente al panel alumno
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Registro de Alumno</h2>
      <form onSubmit={handleRegisterAlumno}>
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
          type="password"
          placeholder="Contraseña"
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
          type="text"
          placeholder="Número de cuenta"
          value={numCuenta}
          onChange={(e) => setNumCuenta(e.target.value)}
          required
        />
        <button type="submit">Registrar Alumno</button>
      </form>
      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
}
