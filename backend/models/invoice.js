import mongoose from 'mongoose';
import Counter from './Counter.js';
import { type } from 'os';

const LineSchema = new mongoose.Schema({
  description: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  lineTotal: { type: Number, required: true, default: 0 }
})

const InvoiceSchema = new mongoose.Schema({
  number: { type: String, unique: true, sparse: true },
  fiscalYear: Number,
  sequence: Number,
  date: { type: Date, default: Date.now },

  status: {
    type: String,
    enum: ['draft', 'issued', 'cancelled', 'rectified'],
    default: 'draft',
  },

  client: {
    name: { type: String, required: true },
    nif: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  lines: [LineSchema],

  base: { type: Number, default: 0 },
  ivaPercent: { type: Number, default: 21 },
  ivaAmount: { type: Number, default: 0 },
  irpfPercent: { type: Number, default: 0 },
  irpfAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  ivaIncluido: { type: Boolean, default: false },

  //  Pagos
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', null],
    default: null,
  },
  iban: { type: String },

  // 🧾 Control y auditoría
  cancelDate: Date,
  cancelReason: String,
  rectifies: String, // número de factura original si es rectificativa
  rectifyReason: String, //  motivo de la rectificación


  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },

  pdfUrl: String
}, { timestamps: true });


// hook pre-validate para asignar número secuencial
InvoiceSchema.pre("validate", async function (next) {
  try {
    const year = new Date().getFullYear();
    // Solo asignar número si se emite o rectifica
    if (!this.number && (this.status === 'issued' || this.status === 'rectified')) {
      // Usa prefijo distinto si estamos en entorno de pruebas
      // Modo dev o producción
      const envPrefix =
        process.env.NODE_ENV === 'production'
          ? 'invoices'
          : 'test-invoices';

      // Prefijo y contador separado por tipo
      const typePrefix = this.rectifies ? "R" : "F";
      const counterId = `${envPrefix}-${typePrefix}-${year}`;

      // Buscar y aumentar contador correspondiente
      const counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );

      this.sequence = counter.seq;
      this.fiscalYear = year;
      // prefijo distinto para rectificativa
       this.number = `${typePrefix}-${year}-${String(counter.seq).padStart(3, '0')}`;
    }

    // 💰 Cálculo de importes
    if (this.lines?.length) {
      this.lines = this.lines.map((l) => ({
        ...l,
        lineTotal: l.qty * l.unitPrice,
      }));

      let base;
      if (this.ivaIncluido && this.ivaPercent > 0) {
        base = this.lines.reduce(
          (sum, l) =>
            sum + (l.unitPrice / (1 + this.ivaPercent / 100)) * l.qty,
          0
        );
      } else {
        base = this.lines.reduce((sum, l) => sum + l.lineTotal, 0);
      }

      this.base = +base.toFixed(2);
      this.ivaAmount = +(this.base * (this.ivaPercent / 100)).toFixed(2);
      this.irpfAmount = +(this.base * (this.irpfPercent / 100)).toFixed(2);

      this.total = this.ivaIncluido
        ? +(this.base - this.irpfAmount + this.ivaAmount).toFixed(2)
        : +(this.base + this.ivaAmount - this.irpfAmount).toFixed(2);
    }

    next();
  } catch (error) {
    next(error);
  }
})

export default mongoose.model('Invoice', InvoiceSchema);
