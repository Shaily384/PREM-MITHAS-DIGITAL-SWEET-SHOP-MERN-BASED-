import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name:          { type: String,  required: true },
  description:   { type: String,  required: true },
  price:         { type: Number,  required: true },
  image:         { type: Array,   required: true },
  category:      { type: String,  required: true },
  subCategory:   { type: String,  default: "" },
  bestseller:    { type: Boolean, default: false },
  date:          { type: Number,  required: true },
  discount:      { type: Number,  default: 0 },
  discountLabel: { type: String,  default: "" },
  avgRating:     { type: Number,  default: 0 },
  reviewCount:   { type: Number,  default: 0 },
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;