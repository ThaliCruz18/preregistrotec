import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import emailjs from "emailjs-com"; // Importa emailjs
import "../styles/adminpanel.css";

export default function AdminPanel() {
  const [seccion, setSeccion] = useState("aspirantes");
  const [aspirantes, setAspirantes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAspirantes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "preregistros"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAspirantes(data);
      } catch (error) {
        console.error("Error al obtener aspirantes:", error);
      }
    };

    const fetchAlumnos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "alumnos"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id, // CURP
          ...doc.data(),
        }));
        setAlumnos(data);
      } catch (error) {
        console.error("Error al obtener alumnos:", error);
      }
    };

    fetchAspirantes();
    fetchAlumnos();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirige al Home
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para enviar correo con EmailJS
  const sendEmail = (aspirante) => {
    const serviceID = "service_ouyxyzi";      // Pon aquí tu Service ID
    const templateID = "template_scqcpnq";   // Pon aquí tu Template ID
    const userID = "KIM3l7B0wOxPrIOkc";      // Pon aquí tu User ID

    const templateParams = {
      nombre: aspirante.nombre,
      email: aspirante.email,
      carrera: aspirante.carrera,
      telefono: aspirante.telefono,
      localidad: aspirante.localidad,
      escuela: aspirante.escuela,
    };

    emailjs
      .send(serviceID, templateID, templateParams, userID)
      .then(
        () => {
          alert(`Correo enviado con éxito a ${aspirante.nombre}`);
        },
        (error) => {
          alert("Error al enviar correo: " + error.text);
          console.error("EmailJS error:", error);
        }
      );
  };

  return (
    <div className="admin-container">
      <div className="admin-header-row">
        <h1 className="admin-header">Panel de Administrador</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <nav className="admin-nav">
        <button
          className={`btn-nav ${seccion === "aspirantes" ? "active" : ""}`}
          onClick={() => setSeccion("aspirantes")}
          disabled={seccion === "aspirantes"}
        >
          Aspirantes
        </button>
        <button
          className={`btn-nav ${seccion === "alumnos" ? "active" : ""}`}
          onClick={() => setSeccion("alumnos")}
          disabled={seccion === "alumnos"}
        >
          Alumnos
        </button>
      </nav>

      <main className="admin-main">
        {seccion === "aspirantes" && (
          <div className="user-list">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Carrera</th>
                  <th>Teléfono</th>
                  <th>Localidad</th>
                  <th>Escuela actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aspirantes.length > 0 ? (
                  aspirantes.map((a) => (
                    <tr key={a.id}>
                      <td>{a.nombre}</td>
                      <td>{a.email}</td>
                      <td>{a.carrera}</td>
                      <td>{a.telefono}</td>
                      <td>{a.localidad}</td>
                      <td>{a.escuela}</td>
                      <td>
                        <button
                          className="btn-seguimiento"
                          onClick={() => sendEmail(a)}
                        >
                          Dar seguimiento
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "1rem" }}>
                      No hay aspirantes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={() => navigate("/register-alumno")}>
  Registrar Nuevo Alumno
</button>


        {seccion === "alumnos" && (
          <div className="user-list">
            <table>
              <thead>
                <tr>
                  <th>CURP (Número de Cuenta)</th>
                  <th>Nombre</th>
                  <th>Carrera</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.length > 0 ? (
                  alumnos.map((alumno) => (
                    <tr key={alumno.id}>
                      <td>{alumno.id}</td>
                      <td>{alumno.nombre}</td>
                      <td>{alumno.carrera}</td>
                      <td>{alumno.email || "No disponible"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>
                      No hay alumnos inscritos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
