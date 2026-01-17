// src/components/Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiFetch from "../services/api";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // obtenemos el usuario logueado


  const tabs = [
    { id: 'servicios', label: 'Servicios', path: '/servicios' },
    { id: 'galeria', label: 'Galería', path: '/galeria' },
    { id: 'comentarios', label: 'Comentarios', path: '/comentarios' },
    { id: 'contacto', label: 'Contacto', path: '/contacto' },
  ];

  // 🔹 Si hay sesión, añadimos el botón “Volver a mi área”
  const fullTabs = user
    ? [...tabs, { id: 'admin', label: 'Volver a mi área', path: '/admin/panel' },]
    : tabs;

  // Detectar cambio de tamaño
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Bloquear scroll al abrir menú móvil
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

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
    <>
      {/* Menú de escritorio */}
      <nav className="Tabs desktop-nav">
        {fullTabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`Tabs__tab ${location.pathname === tab.path ? 'active' : ''} ${tab.id === 'admin' ? 'Tabs__tab--admin' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Menú móvil */}
      {isMobile && (
        <>
          <button
            className={`Mobile-nav-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <div className="hamburger-box">
              <div className="hamburger-inner"></div>
            </div>
          </button>

          <div className={`Mobile-nav-overlay ${menuOpen ? 'open' : ''}`}>
            <nav className="Mobile-nav-links">
              {fullTabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`Mobile-nav__tab ${tab.id === 'admin' ? 'Mobile-nav__tab--admin' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {tab.label}
                </Link>
              ))}

              {/* Mostrar botón de Cerrar sesión SOLO en móvil y solo si hay sesión */}
              {user && (
                <button 
                className="admin-logout" 
                onClick={handleLogout} 
                style={{  padding: 10,  cursor: 'pointer', marginTop: 90, }} >
                  Cerrar sesión
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
