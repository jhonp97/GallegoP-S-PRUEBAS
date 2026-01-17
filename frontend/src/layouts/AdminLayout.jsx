import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiFileText, FiImage, FiBarChart2 } from "react-icons/fi";
import apiFetch from "../services/api";
import { useAuth } from "../context/AuthContext";


const AdminLayout = ({ children }) => {
  const {logout}= useAuth()
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout() // limpiar el usuario en contexto
    navigate("/admin/acceso", { replace: true });
  try {
    await apiFetch("/auth/logout", "POST");
    // Redirige reemplazando el historial → el botón "atrás" no volverá al panel
  } catch (err) {
    console.error(err);
    logout() // limpio aunque falle la peticion
  } 
};


  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Panel</h2>
        <nav>
          <Link to="/admin/panel" className="admin-link">
            <FiFileText /> Facturas
          </Link>
          <Link to="/admin/estadisticas" className="admin-link">
            <FiBarChart2 /> Estadisticas
          </Link>
          <Link to="/admin/fotos" className="admin-link">
            <FiImage /> Galería
          </Link>
        </nav>
        <button className="admin-logout" onClick={handleLogout}>
          <FiLogOut /> Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="admin-content">{children}</main>
    </div>
  );
};

export default AdminLayout;
