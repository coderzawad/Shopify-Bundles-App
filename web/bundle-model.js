import mongoose from 'mongoose';

const bundleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  products: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      imageSrc: { type: String },
      price: { type: String },
    },
  ],
});

const Bundle = mongoose.model('Bundle', bundleSchema);

export default Bundle;
