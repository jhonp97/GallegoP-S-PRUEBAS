import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { jwtSecret, jwtExp } from '../config/config.js';

// helper para crear token
const createToken = (userId) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExp });
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) return res.status(400).json({ message: 'userName y password requeridos' });

    const user = await User.findOne({ userName });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = createToken(user._id);

    // Guardar token en cookie httpOnly (más seguro que localStorage)
    // opción segura: httpOnly, secure en producción, sameSite strict/lax
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días
    });

    res.json({ user: { userName: user.userName, name: user.name }, token
     })

  } catch (err) {
    next(err);
  }
};

// GET /api/auth/check
export const checkSession = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  res.json({ user: { userName: req.user.userName, name: req.user.name } });
};


// GET /api/auth/me
export const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "No autorizado" });
  res.json({ user: { userName: req.user.userName, name: req.user.name } });
};


// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Sesión cerrada' });
};

// POST /api/auth/seed-admin
export const seedAdmin = async (req, res, next) => {
  try {
    const userName = req.body.userName || 'admin@local.test';
    const name = req.body.name || 'Admin';
    const pass = req.body.password || 'Admin123!';
    const exist = await User.findOne({ userName });
    if (exist) return res.status(400).json({ message: 'Admin ya existe' });

    const passwordHash = await bcrypt.hash(pass, 10);
    const admin = await User.create({ userName, name, passwordHash, role: 'admin' });
    res.json({ message: 'Admin creado', admin: { userName: admin.userName, name: admin.name } });
  } catch (err) {
    next(err);
  }
};


// PATCH /api/auth/reset-password (protegido): permite al admin restablecer contraseña de usuario
export const resetPassword = async (req, res, next) => {
  try {
    const { userName, newPassword } = req.body;
    if (!userName || !newPassword) return res.status(400).json({ message: 'userName y newPassword requeridos' });

    const user = await User.findOne({ userName });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
};