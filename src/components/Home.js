// src/components/Home.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import logo from "../assets/Logotec.jpg";

const carreras = [
  {
    id: "info",
    nombre: "Ingeniería Informática",
    mision:
      "Formar profesionales en informática con sólidos conocimientos y habilidades para el desarrollo de soluciones tecnológicas.",
    vision:
      "Ser un programa educativo líder reconocido por su calidad y contribución tecnológica.",
    objetivo:
      "Preparar profesionales capaces de innovar en tecnologías de la información y la comunicación.",
    perfilIngreso:
      "Interés en matemáticas, lógica y tecnología, así como habilidades analíticas.",
    perfilEgreso:
      "Capacidad para diseñar, implementar y administrar sistemas informáticos innovadores.",
  },
  {
    id: "civil",
    nombre: "Ingeniería Civil",
    mision:
      "Formar ingenieros civiles competentes para diseñar, construir y mantener infraestructuras seguras y sustentables.",
    vision:
      "Ser un programa reconocido por su excelencia académica y compromiso social.",
    objetivo:
      "Capacitar profesionales capaces de responder a los retos de infraestructura y urbanismo.",
    perfilIngreso: "Interés en matemáticas, física, construcción y diseño estructural.",
    perfilEgreso:
      "Competencia para planificar, diseñar y supervisar proyectos de ingeniería civil con responsabilidad social.",
  },
  {
    id: "quimica",
    nombre: "Ingeniería Química",
    mision:
      "Formar ingenieros químicos capaces de optimizar procesos industriales con responsabilidad ambiental.",
    vision:
      "Ser un referente en formación química aplicada y desarrollo sostenible.",
    objetivo: "Desarrollar profesionales innovadores en procesos químicos e industriales.",
    perfilIngreso:
      "Conocimientos básicos en química, matemáticas y física, con interés en la industria.",
    perfilEgreso:
      "Habilidad para diseñar, controlar y mejorar procesos químicos e industriales con énfasis en sustentabilidad.",
  },
  {
    id: "industria",
    nombre: "Ingeniería en Industrias Alimentarias",
    mision:
      "Formar profesionales competentes en la producción y control de alimentos con calidad y seguridad.",
    vision:
      "Ser un programa líder en innovación y desarrollo de la industria alimentaria.",
    objetivo:
      "Capacitar ingenieros para innovar en tecnologías alimentarias y asegurar la calidad.",
    perfilIngreso: "Interés en ciencias, tecnología y procesos productivos de alimentos.",
    perfilEgreso:
      "Capacidad para diseñar, controlar y optimizar procesos alimentarios con responsabilidad sanitaria y ambiental.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("");
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUserEmail("");
  };

  const handlePreRegistro = () => {
    if (selectedCarrera) {
      navigate("/preregistro", { state: { carrera: selectedCarrera.nombre } });
    } else {
      alert("Por favor selecciona una carrera primero.");
    }
  };

  const handleSelectCarrera = (carrera) => {
    if (selectedCarrera?.id === carrera.id) {
      setSelectedCarrera(null);
    } else {
      setSelectedCarrera(carrera);
    }
  };

  const getInitial = () => (userEmail ? userEmail.charAt(0).toUpperCase() : "");

  return (
    <div className="home-container">
      <header className="home-header">
        <img src={logo} alt="Logo Institución" className="logo" />
        {userEmail ? (
          <>
            <div className="user-avatar">{getInitial()}</div>
            <button className="btn-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <button
            className="btn-login"
            onClick={() => navigate("/login")}
            title="Estudiantes registrados, inicien sesión"
          >
            Iniciar sesión
          </button>
        )}
      </header>

      <h1>Bienvenido al sistema de preregistrodel TESSFP</h1>
      <p>Selecciona una carrera para conocer su información:</p>

      <div className="carrera-list">
        {carreras.map((c) => (
          <button
            key={c.id}
            className={`carrera-btn ${
              selectedCarrera?.id === c.id ? "active" : ""
            }`}
            onClick={() => handleSelectCarrera(c)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {selectedCarrera && (
        <div className="carrera-info">
          <h2>{selectedCarrera.nombre}</h2>
          <section>
            <h3>Misión</h3>
            <p>{selectedCarrera.mision}</p>
          </section>
          <section>
            <h3>Visión</h3>
            <p>{selectedCarrera.vision}</p>
          </section>
          <section>
            <h3>Objetivo</h3>
            <p>{selectedCarrera.objetivo}</p>
          </section>
          <section>
            <h3>Perfil de Ingreso</h3>
            <p>{selectedCarrera.perfilIngreso}</p>
          </section>
          <section>
            <h3>Perfil de Egreso</h3>
            <p>{selectedCarrera.perfilEgreso}</p>
          </section>

          <button className="btn-preregistro" onClick={handlePreRegistro}>
            Pre-registrarse en esta carrera
          </button>
        </div>
      )}
    </div>
  );
}
