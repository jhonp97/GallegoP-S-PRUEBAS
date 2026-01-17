import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createInvoice, previewInvoice, listInvoices, getInvoice, getInvoicePdf, deleteInvoice, statsInvoices, issueInvoice, cancelInvoice, updateInvoiceDraft, rectifyInvoice, getInvoiceAnalytics, exportInvoicesCSV, exportInvoicesZip } from '../controllers/invoice.controller.js';

const router = express.Router();

router.use(authMiddleware); // todas requieren auth

router.post("/", createInvoice);
router.post("/preview", previewInvoice);
router.get("/", listInvoices);
router.get("/analytics", authMiddleware, getInvoiceAnalytics);
router.get("/stats", statsInvoices);
router.get("/export/csv", exportInvoicesCSV);
router.get("/export/zip", exportInvoicesZip);

router.get("/:id", getInvoice);
router.get("/:id/pdf", getInvoicePdf);

router.patch("/:id", updateInvoiceDraft); // editar borrador
router.post("/:id/issue", issueInvoice); // emitir borrador
router.post("/:id/cancel", cancelInvoice); // anular
router.post("/:id/rectify", rectifyInvoice); // rectificar (crea R-...)

router.delete("/:id", deleteInvoice); // soft delete (solo borradores)


export default router;
