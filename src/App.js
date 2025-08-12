import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import AlumnoPanel from "./components/AlumnoPanel";  // IMPORTANTE: importar AlumnoPanel
import ProtectedRoute from "./components/ProtectedRoute";
import PreRegistro from "./components/PreRegistro";
import RegisterAlumno from "./components/RegisterAlumno";

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

        {/* Protege también el panel alumno, si quieres */}
        <Route
          path="/alumno-panel"
          element={
            <ProtectedRoute>
              <AlumnoPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/preregistro" element={<PreRegistro />} />
      </Routes>
    </Router>
  );
}

export default App;
