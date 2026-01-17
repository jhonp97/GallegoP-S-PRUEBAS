
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="Footer">
      <div className="App-container" style={{ padding: '0 20px' }}>

        {/* ENLACES LEGALES AÑADIDOS */}
        <div className="Footer__links">
          <Link to="/aviso-legal#aviso-legal">Aviso Legal</Link> |
          <Link to="/aviso-legal#privacidad">Política de Privacidad</Link> |
          <Link to="/aviso-legal#cookies">Política de Cookies</Link>
        </div>

        {/* ENLACE DE SOY ADMIN */}
        {!user && (
        <Link to="/admin/acceso" className="link-admin">
          Soy Admin
        </Link>
        )}

        <p>&copy; {new Date().getFullYear()} GALLEGO PRODUCTOS & SERVICIOS SL. Todos los derechos reservados.</p>

        <div className="Footer__socials">
                  <a href="https://www.facebook.com/pelugaca1987" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
                  <a href="https://www.instagram.com/gallegopys?igsh=aDl2a3E2ZWV3MmQ2" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                  <a href="https://wa.me/34633658703" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
                </div>

      </div>
    </footer>
  );
};

export default Footer;