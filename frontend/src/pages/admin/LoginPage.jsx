
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [verContraseña, setVerContraseña] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const manejarLogin = async (evento) => {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const data = await apiFetch('/auth/login', 'POST', { userName, password });
      login(data.user); // guardamos usuario en contexto global
      navigate('/admin/panel', { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setCargando(false);
    }
  };


  return (
    <div className="Login-container">
      <form onSubmit={manejarLogin} className="Login-form">
        <h2>Acceso de Administrador</h2>
        <div className="Form-group">
          <label htmlFor="userName">Nombre de Usuario</label>
          <input
            id="userName"
            type="text"
            value={userName}
            placeholder="Kakashi777"
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div className="Form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type={verContraseña ? 'text' : 'password'}
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

        
        {/* boton para ver contraseña */}
          <button
            type="button"
            onClick={() => setVerContraseña(!verContraseña)}
            className="ver-contraseña-button"
          >
            {verContraseña ? <FiEyeOff /> : <FiEye />}
          </button>

        </div>
        {error && <p className="Error-message">{error}</p>}
        <button 
        className="Login-form-btn" 
        type="submit" disabled={cargando}>
          {cargando ? 'Accediendo...' : 'Acceder'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;