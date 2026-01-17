import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
try{
    // 1. intentar leer el token desde la cookie "token"
const token =
  (req.cookies && req.cookies.token) ||
  (req.header('Authorization')?.startsWith('Bearer ') && req.header('Authorization').split(' ')[1]);

    if(!token){ return res.status(401).json({ message: 'No autorizado: token faltante' });
}

// 2. verificar el token
const payload = jwt.verify(token, jwtSecret);
// payload contiene al menos: {userId, iat, exp}

// adjuntar ususario al request
const user= await User.findById(payload.userId).select('-passwordHash');
if(!user) return res.status(401).json({ message: 'usuario no existe' });

req.user = user;
next();
}catch(err){
     return res.status(401).json({ message: 'Token inválido o expirado' });
}
}