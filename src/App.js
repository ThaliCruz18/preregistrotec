import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/login";              // Asegúrate que el archivo se llama Login.js con mayúscula
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import AlumnoPanel from "./components/AlumnoPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import PreRegistro from "./components/PreRegistro";
import RegisterAlumno from "./components/RegisterAlumno";

import ExamPage from "./pages/ExamPage";             // Página de examen, verificar que exista en ./pages
import ExamResults from "./components/ExamResults";  // Resultados de exámenes

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-alumno" element={<RegisterAlumno />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno-panel"
          element={
            <ProtectedRoute>
              <AlumnoPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/preregistro" element={<PreRegistro />} />

        {/* Ruta para examen (acceso por link enviado en correo) */}
        <Route path="/examen/:tipo/:uid" element={<ExamPage />} />

        {/* Ruta protegida para que admin vea resultados */}
        <Route
          path="/resultados"
          element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;