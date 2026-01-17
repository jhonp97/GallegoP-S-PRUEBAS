// import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import apiFetch from "../services/api";

// /**
//  * ProtectedRoute:
//  * - Comprueba si hay sesión activa llamando al backend.
//  * - Si no hay token o expira, redirige a /admin/acceso.
//  */
// const ProtectedRoute = ({ children }) => {
//   const [auth, setAuth] = useState(null); // null = cargando, true = ok, false = no autorizado

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         // endpoint ligero para validar el token
//         const data = await apiFetch("/invoices", "GET");
//         if (data) setAuth(true);
//       } catch (err) {
//         setAuth(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   if (auth === null) return <p style={{ textAlign: "center" }}>Verificando sesión...</p>;

//   return auth ? children : <Navigate to="/admin/acceso" replace />;
// };

// export default ProtectedRoute;

// ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ textAlign: 'center' }}>Verificando sesión...</p>;
  return user ? children : <Navigate to="/admin/acceso" replace />;
};

export default ProtectedRoute;

