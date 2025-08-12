import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración desde Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAZGwuYZRAqNyby9pJtrNO6SHMFvrhjAUY",
  authDomain: "prerregistro-app.firebaseapp.com",
  projectId: "prerregistro-app",
  storageBucket: "prerregistro-app.appspot.com",
  messagingSenderId: "122606428442",
  appId: "1:122606428442:web:34971f435f3b6a32374ca3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
