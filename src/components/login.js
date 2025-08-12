import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [usuario, setUsuario] = useState(""); // nombre completo o correo
  const [password, setPassword] = useState(""); // número de cuenta o contraseña
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAlumnoLogin = async () => {
    setError("");
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor llena todos los campos");
      return;
    }

    try {
      // Consulta alumnos por nombre
      const qNombre = query(collection(db, "alumnos"), where("nombre", "==", usuario.trim()));
      const querySnapshotNombre = await getDocs(qNombre);

      // Consulta alumnos por email
      const qEmail = query(collection(db, "alumnos"), where("email", "==", usuario.trim()));
      const querySnapshotEmail = await getDocs(qEmail);

      const resultados = [...querySnapshotNombre.docs, ...querySnapshotEmail.docs];

      if (resultados.length === 0) {
        setError("Alumno no encontrado");
        return;
      }

      // Validar contraseña (número de cuenta)
      let alumnoEncontrado = null;
      resultados.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.password === password.trim()) {
          alumnoEncontrado = { ...data, id: docSnap.id };
        }
      });

      if (!alumnoEncontrado) {
        setError("Número de cuenta incorrecto");
        return;
      }

      // Login correcto: redirigir a panel alumno pasando el alumno
      navigate("/alumno-panel", { state: { alumno: alumnoEncontrado } });
    } catch (e) {
      setError("Error al buscar alumno: " + e.message);
    }
  };

  const handleAdminLogin = async () => {
    setError("");
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor llena todos los campos");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, usuario.trim().toLowerCase(), password);
      navigate("/admin");
    } catch (e) {
      setError("Credenciales inválidas para admin");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (usuario.includes("@")) {
        // Usuario con arroba se asume admin con email
        handleAdminLogin();
      } else {
        // Si no, alumno (nombre o email sin arroba)
        handleAlumnoLogin();
      }
    } else {
      setError("Para registrar alumnos usa el formulario de registro");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrar Usuario"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre completo o correo"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Número de cuenta o contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Ingresar" : "Registrarse"}</button>
      </form>
      <p className="error">{error}</p>
      <p className="toggle">
        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Regístrate" : "Iniciar Sesión"}
        </button>
      </p>
    </div>
  );
}
