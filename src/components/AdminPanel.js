import React, { useState, useEffect } from "react"; 
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import emailjs from "emailjs-com";
import "../styles/adminpanel.css";

// Definimos materias con horarios por carrera
const materiasPorCarrera = {
  "Ingeniería Informática": [
    { nombre: "Matemáticas I", horario: "08:00 - 09:30" },
    { nombre: "Programación Básica", horario: "09:30 - 11:00" },
    { nombre: "Fundamentos de Computación", horario: "11:00 - 12:30" },
    { nombre: "Introducción a Bases de Datos", horario: "13:30 - 15:00" },
    { nombre: "Inglés Técnico", horario: "15:00 - 16:00" },
  ],
  "Ingeniería Civil": [
    { nombre: "Matemáticas I", horario: "08:00 - 09:30" },
    { nombre: "Dibujo Técnico", horario: "09:30 - 11:00" },
    { nombre: "Materiales de Construcción", horario: "11:00 - 12:30" },
    { nombre: "Topografía", horario: "13:30 - 15:00" },
    { nombre: "Inglés Técnico", horario: "15:00 - 16:00" },
  ],
  "Ingeniería Química": [
    { nombre: "Química General", horario: "08:00 - 09:30" },
    { nombre: "Matemáticas I", horario: "09:30 - 11:00" },
    { nombre: "Física I", horario: "11:00 - 12:30" },
    { nombre: "Laboratorio de Química", horario: "13:30 - 15:00" },
    { nombre: "Inglés Técnico", horario: "15:00 - 16:00" },
  ],
  "Ingeniería en Industrias Alimentarias": [
    { nombre: "Química de Alimentos", horario: "08:00 - 09:30" },
    { nombre: "Microbiología de Alimentos", horario: "09:30 - 11:00" },
    { nombre: "Bioquímica", horario: "11:00 - 12:30" },
    { nombre: "Tecnología de Procesos Alimentarios", horario: "13:30 - 15:00" },
    { nombre: "Inglés Técnico", horario: "15:00 - 16:00" },
  ],
  // Agrega más carreras y materias aquí según necesites
};

export default function AdminPanel() {
  const [vista, setVista] = useState("aspirantes"); // aspirantes, alumnos o talleres
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Talleres
  const [talleres, setTalleres] = useState([]);
  const [nuevoTallerNombre, setNuevoTallerNombre] = useState("");
  const [nuevoTallerCupos, setNuevoTallerCupos] = useState(25);

  // Formulario agregar alumno
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoExamen, setTipoExamen] = useState("propedeutico");
  const [carreraAlumno, setCarreraAlumno] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");

  useEffect(() => {
    if (vista === "talleres") {
      cargarTalleres();
    } else {
      cargarDatos();
    }
  }, [vista]);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");
    try {
      const nombreColeccion = vista === "aspirantes" ? "preregistros" : "alumnos";
      const col = collection(db, nombreColeccion);
      const snapshot = await getDocs(col);
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLista(datos);
    } catch (error) {
      setMensaje("Error al cargar datos: " + error.message);
    }
    setLoading(false);
  }

  async function cargarTalleres() {
    setLoading(true);
    setMensaje("");
    try {
      const docRef = doc(db, "talleres", "datos");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTalleres(docSnap.data().talleres);
      } else {
        setTalleres([]);
      }
    } catch (error) {
      setMensaje("Error al cargar talleres: " + error.message);
    }
    setLoading(false);
  }

  async function agregarTaller(e) {
    e.preventDefault();
    setMensaje("");
    if (!nuevoTallerNombre.trim()) {
      setMensaje("El nombre del taller es requerido");
      return;
    }
    const tallerExistente = talleres.find(
      (t) => t.nombre.toLowerCase() === nuevoTallerNombre.toLowerCase()
    );
    if (tallerExistente) {
      setMensaje("El taller ya existe");
      return;
    }

    const nuevoTaller = {
      nombre: nuevoTallerNombre.trim(),
      cupos: parseInt(nuevoTallerCupos) || 25,
      inscritos: 0,
    };

    const talleresActualizados = [...talleres, nuevoTaller];

    try {
      const docRef = doc(db, "talleres", "datos");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { talleres: talleresActualizados });
      } else {
        await setDoc(docRef, { talleres: talleresActualizados });
      }
      setTalleres(talleresActualizados);
      setNuevoTallerNombre("");
      setNuevoTallerCupos(25);
      setMensaje("Taller agregado correctamente");
    } catch (error) {
      setMensaje("Error al agregar taller: " + error.message);
    }
  }

  async function actualizarCupos(index, cupos) {
    if (isNaN(cupos) || cupos < 0) return;
    const talleresActualizados = [...talleres];
    talleresActualizados[index].cupos = parseInt(cupos);

    setMensaje("");
    try {
      const docRef = doc(db, "talleres", "datos");
      await updateDoc(docRef, { talleres: talleresActualizados });
      setTalleres(talleresActualizados);
      setMensaje("Cupos actualizados correctamente");
    } catch (error) {
      setMensaje("Error al actualizar cupos: " + error.message);
    }
  }

  // Dar seguimiento solo a aspirantes
  async function darSeguimiento(usuario) {
    setMensaje("");
    try {
      const tipoExamenAsignado = "propedeutico";

      let uid = usuario.uid;
      if (!uid) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          usuario.email,
          "123456"
        );
        uid = userCredential.user.uid;

        // Agregamos alumno a la colección alumnos sin materias ni carrera, porque es aspirante
        await addDoc(collection(db, "alumnos"), {
          uid,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: "alumno",
          examenAsignado: tipoExamenAsignado,
          estadoExamen: "pendiente",
        });
      }

      const examLink = `${window.location.origin}/examen/${tipoExamenAsignado}/${uid}`;

      const q = query(collection(db, "alumnos"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const alumnoDoc = querySnapshot.docs[0];
        await updateDoc(alumnoDoc.ref, {
          examenAsignado: tipoExamenAsignado,
          examenLink: examLink,
          estadoExamen: "pendiente",
        });
      }

      const serviceID = "service_ouyxyzi";
      const templateID = "template_scqcpnq";
      const userID = "KIM3l7B0wOxPrIOkc";

      const templateParams = {
        nombre: usuario.nombre,
        email: usuario.email,
        tipoExamen: tipoExamenAsignado,
        linkExamen: examLink,
      };

      await emailjs.send(serviceID, templateID, templateParams, userID);

      setMensaje(`Correo enviado y examen asignado a ${usuario.nombre}`);
      cargarDatos();
    } catch (error) {
      setMensaje("Error en dar seguimiento: " + error.message);
    }
  }

  // Registro de nuevo alumno (NO aspirante) con materias y horarios asignados
  async function handleRegister(e) {
    e.preventDefault();
    setMensaje("");

    if (!carreraAlumno) {
      setMensaje("Por favor, selecciona la carrera del alumno.");
      return;
    }
    if (!numeroCuenta.trim()) {
      setMensaje("Por favor, ingresa el número de cuenta del alumno.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Materias y horarios asignados automáticamente según la carrera
      const materiasAsignadas = materiasPorCarrera[carreraAlumno] || [];

      await setDoc(doc(db, "alumnos", user.uid), {
        uid: user.uid,
        nombre,
        email,
        rol: "alumno",
        carrera: carreraAlumno,
        numeroCuenta: numeroCuenta.trim(),
        materias: materiasAsignadas,
        estadoExamen: "completado", // porque no se asigna examen aquí
      });

      setMensaje(`Alumno ${nombre} agregado correctamente`);
      setEmail("");
      setPassword("");
      setNombre("");
      setTipoExamen("propedeutico");
      setCarreraAlumno("");
      setNumeroCuenta("");
      cargarDatos();
    } catch (error) {
      setMensaje("Error al agregar alumno: " + error.message);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setMensaje("Sesión cerrada correctamente");
      window.location.reload();
    } catch (error) {
      setMensaje("Error al cerrar sesión: " + error.message);
    }
  }

  return (
    <div className="admin-panel-container" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Panel de Administración</h2>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
          title="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="vista-selector" style={{ marginBottom: "20px" }}>
        <button
          className={vista === "aspirantes" ? "active" : ""}
          onClick={() => setVista("aspirantes")}
        >
          Aspirantes
        </button>
        <button
          className={vista === "alumnos" ? "active" : ""}
          onClick={() => setVista("alumnos")}
        >
          Alumnos
        </button>
        <button
          className={vista === "talleres" ? "active" : ""}
          onClick={() => setVista("talleres")}
        >
          Talleres
        </button>
      </div>

      {loading ? (
        <p>Cargando {vista}...</p>
      ) : vista === "talleres" ? (
        <>
          {talleres.length === 0 ? (
            <p>No hay talleres disponibles.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "#fff" }}>
                  <th>Nombre</th>
                  <th>Cupos</th>
                  <th>Inscritos</th>
                </tr>
              </thead>
              <tbody>
                {talleres.map((taller, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                    <td>{taller.nombre}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={taller.cupos}
                        onChange={(e) => actualizarCupos(idx, e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>{taller.inscritos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <form
            onSubmit={agregarTaller}
            style={{ marginTop: "20px", maxWidth: "400px" }}
          >
            <input
              type="text"
              placeholder="Nombre del taller"
              value={nuevoTallerNombre}
              onChange={(e) => setNuevoTallerNombre(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
            />
            <input
              type="number"
              placeholder="Cupos"
              value={nuevoTallerCupos}
              onChange={(e) => setNuevoTallerCupos(e.target.value)}
              min={0}
              style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px",
                border: "none",
                cursor: "pointer",
                width: "100%",
                fontWeight: "bold",
              }}
            >
              Agregar Taller
            </button>
          </form>
        </>
      ) : (
        // Vista aspirantes o alumnos
        <>
          {vista === "aspirantes" ? (
            <table
              className="tabla-usuarios"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#333", color: "#fff" }}>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Localidad</th>
                  <th>Escuela</th>
                  <th>Carrera</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No hay aspirantes
                    </td>
                  </tr>
                ) : (
                  lista.map((usuario) => (
                    <tr key={usuario.id} style={{ borderBottom: "1px solid #ccc" }}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.telefono}</td>
                      <td>{usuario.localidad}</td>
                      <td>{usuario.escuela}</td>
                      <td>{usuario.carrera}</td>
                      <td>
                        {usuario.fecha
                          ? new Date(usuario.fecha.seconds * 1000).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="btn-seguimiento"
                          onClick={() => darSeguimiento(usuario)}
                        >
                          Dar seguimiento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <>
              {/* Formulario para agregar alumno con materias asignadas */}
              <form
                onSubmit={handleRegister}
                style={{
                  maxWidth: "500px",
                  margin: "20px auto",
                  padding: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3>Agregar nuevo alumno</h3>

                <label>Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />

                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />

                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />

                <label>Carrera</label>
                <select
                  value={carreraAlumno}
                  onChange={(e) => setCarreraAlumno(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                >
                  <option value="">-- Selecciona carrera --</option>
                  {Object.keys(materiasPorCarrera).map((carrera) => (
                    <option key={carrera} value={carrera}>
                      {carrera}
                    </option>
                  ))}
                </select>

                <label>Número de cuenta</label>
                <input
                  type="text"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />

                <button
                  type="submit"
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    padding: "10px",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  Agregar alumno
                </button>
              </form>

              {/* Tabla alumnos */}
              <table
                className="tabla-usuarios"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#333", color: "#fff" }}>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Carrera</th>
                    <th>Número de cuenta</th>
                    <th>Materias</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No hay alumnos registrados
                      </td>
                    </tr>
                  ) : (
                    lista.map((alumno) => (
                      <tr key={alumno.id} style={{ borderBottom: "1px solid #ccc" }}>
                        <td>{alumno.nombre}</td>
                        <td>{alumno.email}</td>
                        <td>{alumno.carrera}</td>
                        <td>{alumno.numeroCuenta}</td>
                        <td>
                          <ul style={{ paddingLeft: "1.2rem", textAlign: "left" }}>
                            {(alumno.materias || []).map((mat, i) => (
                              <li key={i}>
                                {typeof mat.nombre === "string" ? mat.nombre : ""}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
      {mensaje && (
        <p
          style={{
            color: mensaje.toLowerCase().includes("error") ? "red" : "green",
            marginTop: "15px",
            fontWeight: "600",
          }}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}