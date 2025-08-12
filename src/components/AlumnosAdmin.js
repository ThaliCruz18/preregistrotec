import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function AlumnosAdmin() {
  const [alumnos, setAlumnos] = useState([]);

  useEffect(() => {
    async function fetchAlumnos() {
      const snapshot = await getDocs(collection(db, "alumnos"));
      setAlumnos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchAlumnos();
  }, []);

  return (
    <div>
      <h2>Alumnos Registrados</h2>
      <ul>
        {alumnos.map((a) => (
          <li key={a.id}>
            {a.nombre} - {a.email} - {a.numCuenta} - {a.carrera}
          </li>
        ))}
      </ul>
    </div>
  );
}
