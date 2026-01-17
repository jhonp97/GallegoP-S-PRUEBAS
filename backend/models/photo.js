import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  title: String,
  url: { type: String, required: true },
  publicId: String,

  album: { type: String, required: true },
  order: { type: Number, default: 0 }, 
  featured: { type: Boolean, default: false }, 

  alt: { type: String }, 
  published: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Photo', PhotoSchema);


