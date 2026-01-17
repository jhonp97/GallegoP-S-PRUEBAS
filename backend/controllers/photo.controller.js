// controllers/photo.controller.js
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import Photo from '../models/photo.js';
import { cloudinaryUrl } from '../config/config.js';

cloudinary.v2.config({ secure: true });
if (cloudinaryUrl) cloudinary.v2.config({ cloudinary_url: cloudinaryUrl });

// Upload desde buffer stream
export const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

    const { originalname } = req.file;
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: 'photos' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const { album } = req.body;

    const photo = await Photo.create({
      title: originalname,
      url: result.secure_url,
      publicId: result.public_id,
      album,
      createdBy: req.user._id
    });

    res.status(201).json({ photo });
  } catch (err) {
    next(err);
  }
};

export const listPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.json({ data: photos });
  } catch (err) {
    next(err);
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    
    
    const photo = await Photo.findByIdAndDelete(id);
    
    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }
    await cloudinary.v2.uploader.destroy(photo.publicId);
    
    res.json({ message: "Foto eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    res.status(500).json({ message: "Error al eliminar la foto" });
  }
};



export const listPublicPhotos = async (req, res) => {
  const photos = await Photo.find({ published: true })
    .sort({ createdAt: -1 });

  res.json({ data: photos });
};

export const updateOrder = async (req, res) => {
  const { updates } = req.body;

  await Promise.all(
    updates.map(u =>
      Photo.findByIdAndUpdate(u.id, { order: u.order })
    )
  );

  res.json({ success: true });
};

export const setFeatured = async (req, res) => {
  const { album, photoId } = req.body;

  await Photo.updateMany({ album }, { featured: false });
  await Photo.findByIdAndUpdate(photoId, { featured: true });

  res.json({ success: true });
};


