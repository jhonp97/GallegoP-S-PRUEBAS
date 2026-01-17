import React, { createContext, useEffect, useState, useContext } from "react";
import apiFetch from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // si hay sesión activa, guardamos el usuario
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // comprobar sesión persistente al cargar la app
    const verifySession = async () => {
      try {
        const res = await apiFetch("/auth/check", "GET");
        setUser(res.user); // backend debe devolver el usuario si hay cookie válida
      } catch (err) {
        // si 401, simplemente no hay usuario, no hay que mostrar error en consola
      if (err.message !== "No autorizado: token faltante") {
        console.error(err);
      }
      setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
