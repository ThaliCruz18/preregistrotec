import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Aspirantes() {
  const [preregistros, setPreregistros] = useState([]);

  useEffect(() => {
    async function fetchPreregistros() {
      const snapshot = await getDocs(collection(db, "preregistros"));
      setPreregistros(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchPreregistros();
  }, []);

  return (
    <div>
      <h2>Aspirantes Preregistrados</h2>
      <ul>
        {preregistros.map((p) => (
          <li key={p.id}>
            {p.nombre} - {p.email} - {p.carrera}
          </li>
        ))}
      </ul>
    </div>
  );
}
