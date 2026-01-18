
import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 4000;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const mongoURI = process.env.MONGO_URI;
// export const mongoURI = process.env.NODE_ENV === 'production'
//   ? process.env.MONGO_URI_PROD
//   : process.env.MONGO_URI_DEV;

export const jwtSecret = process.env.JWT_SECRET;
export const jwtExp = process.env.JWT_EXP || '7d';
export const cloudinaryUrl = process.env.CLOUDINARY_URL;
export const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const backendURL = process.env.BACKEND_URL || `http://localhost:${port}`;

export const companyData = {
  name: process.env.COMPANY_NAME || 'Empresa Ejemplo',
  nif: process.env.COMPANY_NIF || 'NIF00000000',
  address: process.env.COMPANY_ADDRESS || 'CALLE FALSA 123, 28080, Madrid',
  logo: process.env.LOGO_URL || './logo.png',
  signature: process.env.SIGNATURE_URL || './signature.png'
};
