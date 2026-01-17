// import express from 'express';
// import { login, seedAdmin, logout } from '../controllers/auth.controller.js';
// import { authMiddleware } from '../middleware/auth.middleware.js';
// import { createInvoice, getInvoice, listInvoices, getInvoicePdf, deleteInvoice } from './controllers/invoice.controller.js';

// const router = express.Router();
// router.use(authMiddleware); // todas las rutas de invoices requieren auth

// // Rutas para /api/auth
// router.post('/login', login);
// router.post('/seed-admin', seedAdmin); // ejecutar una vez en local para crear admin
// router.post('/logout', logout);


// // Rutas para /api/invoices
// router.post('/', createInvoice);
// router.get('/', listInvoices);
// router.get('/:id', getInvoice);
// router.get('/:id/pdf', getInvoicePdf);
// router.delete('/:id', deleteInvoice);

// export default router;
