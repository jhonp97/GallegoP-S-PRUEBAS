// index.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { port, mongoURI, frontendURL } from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import photoRoutes from './routes/photo.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Middlewares globales
app.use(morgan('dev')); // logging de peticiones
app.use(express.json()); // parsea application/json
app.use(cookieParser()); // parsea cookies
app.use(cors({
  origin: frontendURL,
  credentials: true // necesario si usamos cookies
}));

app.use("/health", (req, res) => {
  res.status(200).send("Servidor corriendo correctamente");
});

// rutas
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/photos', photoRoutes);
// app.use("/api/google", googleRoutes);


// middleware final de errores
app.use(errorHandler);

// conexión a MongoDB (async IIFE)
(async () => {
  try {
    // Conexión moderna: mongoose se encarga internamente de opciones actuales.
    await mongoose.connect(mongoURI, {
      // opciones antiguas ya no son necesarias en versiones recientes,
      // se mantienen si tu versión las requiere.
    });

    console.log('🟢 MongoDB conectado');

    // Mostrar colecciones disponibles (útil para verificar en Compass)
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Colecciones en la base:', collections.map(c => c.name).join(', '));

    if (process.env.NODE_ENV === "development") {
        app.listen(port, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
      });
    }
  } catch (err) {
    console.error('🔴 Error conectando a MongoDB:', err);
    process.exit(1);
  }
})();

export default app;