// src/components/AlumnoPanel.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/alumnoPanel.css";

export default function AlumnoPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const alumno = location.state?.alumno;

  const [talleresInscritos, setTalleresInscritos] = useState([]);
  const [talleresDisponibles, setTalleresDisponibles] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!alumno) {
      navigate("/login");
      return;
    }
    // Cargar talleres inscritos y talleres disponibles
    async function cargarDatos() {
      try {
        // Traer talleres inscritos del alumno
        const alumnoDocRef = doc(db, "alumnos", alumno.uid);
        const alumnoDocSnap = await getDoc(alumnoDocRef);
        const dataAlumno = alumnoDocSnap.exists() ? alumnoDocSnap.data() : {};
        setTalleresInscritos(dataAlumno.talleres || []);

        // Traer talleres disponibles
        const talleresDocRef = doc(db, "talleres", "datos");
        const talleresDocSnap = await getDoc(talleresDocRef);
        const dataTalleres = talleresDocSnap.exists() ? talleresDocSnap.data().talleres : [];
        setTalleresDisponibles(dataTalleres || []);
      } catch (error) {
        setMensaje("Error al cargar datos: " + error.message);
      }
    }
    cargarDatos();
  }, [alumno, navigate]);

  const handleAgregarTaller = async () => {
    if (!seleccionado) {
      setMensaje("Por favor, selecciona un taller.");
      return;
    }
    if (talleresInscritos.includes(seleccionado)) {
      setMensaje("Ya estás inscrito en ese taller.");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      // Obtener talleres de Firestore para verificar cupos
      const talleresDocRef = doc(db, "talleres", "datos");
      const talleresDocSnap = await getDoc(talleresDocRef);
      if (!talleresDocSnap.exists()) {
        setMensaje("No se encontró la información de talleres.");
        setLoading(false);
        return;
      }

      const talleresArray = talleresDocSnap.data().talleres || [];
      const indexTaller = talleresArray.findIndex(t => t.nombre === seleccionado);
      if (indexTaller === -1) {
        setMensaje("El taller seleccionado no existe.");
        setLoading(false);
        return;
      }

      const tallerSeleccionado = talleresArray[indexTaller];
      if (tallerSeleccionado.inscritos >= tallerSeleccionado.cupos) {
        setMensaje("Lo siento, el taller está lleno.");
        setLoading(false);
        return;
      }

      // Actualizar inscritos del taller
      talleresArray[indexTaller].inscritos += 1;
      await updateDoc(talleresDocRef, { talleres: talleresArray });

      // Actualizar talleres inscritos del alumno (crear doc si no existe)
      const alumnoDocRef = doc(db, "alumnos", alumno.uid);
      const alumnoDocSnap = await getDoc(alumnoDocRef);

      if (!alumnoDocSnap.exists()) {
        // Crear documento nuevo con el taller inscrito
        await setDoc(alumnoDocRef, {
          talleres: [seleccionado],
          nombre: alumno.nombre,
          email: alumno.email,
          // otros campos que consideres necesarios
        });
        setTalleresInscritos([seleccionado]);
      } else {
        // Actualizar doc existente
        const nuevosTalleres = [...talleresInscritos, seleccionado];
        await updateDoc(alumnoDocRef, { talleres: nuevosTalleres });
        setTalleresInscritos(nuevosTalleres);
      }

      setMensaje("Taller inscrito con éxito.");
    } catch (error) {
      setMensaje("Error al inscribir taller: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!alumno) return null;

  return (
    <div className="alumno-panel-container">
      <h1>Bienvenido, {alumno.nombre}</h1>
      <p>Carrera: {alumno.carrera || "No disponible"}</p>
      <p>Número de cuenta: {alumno.numeroCuenta || alumno.password || "No disponible"}</p>

      <h2>Materias inscritas</h2>
      <ul>{(alumno.materias || []).map((mat, idx) => <li key={idx}>{mat}</li>)}</ul>

      <h2>Talleres inscritos</h2>
      <ul>{talleresInscritos.map((taller, idx) => <li key={idx}>{taller}</li>)}</ul>

      <h2>Talleres disponibles</h2>
      <select
        value={seleccionado}
        onChange={(e) => setSeleccionado(e.target.value)}
        disabled={loading}
      >
        <option value="">-- Selecciona un taller --</option>
        {talleresDisponibles.map((taller, idx) => (
          <option
            key={idx}
            value={taller.nombre}
            disabled={taller.inscritos >= taller.cupos}
          >
            {taller.nombre} ({taller.inscritos}/{taller.cupos})
          </option>
        ))}
      </select>
      <button onClick={handleAgregarTaller} disabled={loading}>
        {loading ? "Inscribiendo..." : "Inscribir Taller"}
      </button>

      {mensaje && (
        <p style={{ marginTop: 10, color: mensaje.includes("Error") ? "red" : "green" }}>
          {mensaje}
        </p>
      )}

      <button onClick={() => navigate("/login")}>Cerrar sesión</button>
    </div>
  );
}