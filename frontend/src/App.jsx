
import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header'
import Footer from './components/Footer';
import Navigation from './components/Navigation'
// import Products from './components/Products'
import Services from './components/Services'
import Gallery from './components/Gallery'
import Comments from './components/Comments'
import Contact from './components/Contact'
import WhatsAppButton from './components/WhatsAppButton';
import LegalPage from './components/LegalPage';
import LoginPage from './pages/admin/LoginPage';
import AdminPanel from './pages/admin/AdminPanel';
import AdminStats from './pages/admin/AdminStats';
import AdminGallery from './pages/admin/AdminGallery';
import ProtectedRoute from './components/ProtectedRoute';
import { useLocation } from 'react-router-dom';


import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa'
// import Chatbot from './components/Chatbot'

function App() {
  const location = useLocation();
  // const [activeTab, setActiveTab] = useState('servicios')
  // const [selectedAlbum, setSelectedAlbum] = useState(null)

  // const handleSelectAlbum = (albumName) => {
  //   setSelectedAlbum(albumName)
  //   setActiveTab('galeria')
  //   setTimeout(() => {
  //     const galeria = document.getElementById('galeria')
  //     if (galeria) galeria.scrollIntoView({ behavior: 'smooth' })
  //   }, 100)
  // }

  // 🔹 Detecta si estamos dentro del área admin
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
      {/* 🔸 Mostrar Header solo en la web pública */}
      {!isAdminRoute && (
        <>
          <Header />
          <WhatsAppButton />



          <Navigation />
          <main className="App-container">
            <Routes>
              <Route path="/" element={<Services />} />
              <Route path="/servicios" element={<Services />} />
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/comentarios" element={<Comments />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/aviso-legal" element={<LegalPage />} />

              {/* --- Admin --- */}
              <Route path="/admin/acceso" element={<LoginPage />} />
              <Route path="/admin/*" element={null} />
              {/* Página 404 */}
              <Route path="*" element={<h2>Página no encontrada</h2>} />
            </Routes>
          </main>



          {/* 🔹 WhatsApp y Footer siempre visibles */}

          <Footer />
        </>
      )}
      {isAdminRoute && (
        <>
          <Navigation />
          <Routes>
            <Route
              path="/admin/panel"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/estadisticas" element={
                <ProtectedRoute>
                  <AdminStats />
                </ProtectedRoute>
              } />
              <Route path="/admin/fotos" element={
                <ProtectedRoute>
                  <AdminGallery />
                </ProtectedRoute>
              } />
            <Route path="/admin/acceso" element={<LoginPage />} />
          </Routes>

          {/* 🔹 WhatsApp y Footer siempre visibles */}

          <Footer />
        </>
      )}
    </>
  );
}

export default App;