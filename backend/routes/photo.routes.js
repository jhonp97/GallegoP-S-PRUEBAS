// routes/photo.routes.js
import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadPhoto, listPhotos, deletePhoto, listPublicPhotos, updateOrder, setFeatured } from '../controllers/photo.controller.js';

const router = express.Router();
const upload = multer(); // memory storage

router.get('/public', listPublicPhotos);

router.post('/', authMiddleware, upload.single('file'), uploadPhoto);
router.get('/', authMiddleware, listPhotos);
router.patch('/order', authMiddleware, updateOrder);
router.patch('/featured', authMiddleware, setFeatured);

router.delete('/:id', authMiddleware, deletePhoto);


export default router;
