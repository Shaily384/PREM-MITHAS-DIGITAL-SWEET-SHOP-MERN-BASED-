import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import orderModel   from "../models/orderModel.js";

/* ── Add Product ── */
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, bestseller, discount, discountLabel } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(Boolean);

    const imagesUrl = await Promise.all(
      images.map(item => cloudinary.uploader.upload(item.path, { resource_type: "image" }).then(r => r.secure_url))
    );

    await new productModel({
      name, description, category,
      subCategory: subCategory || "",
      price:         Number(price),
      bestseller:    bestseller === "true",
      discount:      Number(discount) || 0,
      discountLabel: discountLabel || "",
      image:         imagesUrl,
      date:          Date.now(),
    }).save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── List Products ── */
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── Remove Product ── */
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── Single Product ── */
const singleProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.body.productId);
    res.json({ success: true, product });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── Update Product (+ discount) ── */
export const updateProduct = async (req, res) => {
  try {
    const { id, name, price, category, description, bestseller, discount, discountLabel } = req.body;
    await productModel.findByIdAndUpdate(id, {
      name, price, category, description, bestseller,
      discount: Number(discount) || 0,
      discountLabel: discountLabel || "",
    });
    res.json({ success: true, message: "Product updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── Sales Insights (admin) ── */
export const salesInsights = async (req, res) => {
  try {
    const orders  = await orderModel.find({});
    const products = await productModel.find({});

    // Count units sold per product
    const salesMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const id = String(item.productId || item._id);
        salesMap[id] = (salesMap[id] || 0) + item.quantity;
      });
    });

    const enriched = products.map(p => ({
      _id:          p._id,
      name:         p.name,
      category:     p.category,
      price:        p.price,
      image:        p.image,
      bestseller:   p.bestseller,
      discount:     p.discount,
      avgRating:    p.avgRating,
      reviewCount:  p.reviewCount,
      unitsSold:    salesMap[String(p._id)] || 0,
      revenue:      (salesMap[String(p._id)] || 0) * p.price,
    }));

    enriched.sort((a, b) => b.unitsSold - a.unitsSold);

    res.json({ success: true, insights: enriched });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };