import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Function to add a product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, bestseller } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      subCategory, // Matches the new field in your Admin Add page
      price: Number(price),
      bestseller: bestseller === "true",
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to list all products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to remove a product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to update a product
const updateProduct = async (req, res) => {
  try {
    const { id, name, price, category, subCategory, description, bestseller } = req.body;

    await productModel.findByIdAndUpdate(id, {
      name,
      price,
      category,
      subCategory,
      description,
      bestseller,
    });

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// All names here must match the function names above exactly
// At the bottom of backend/controllers/productController.js
export { addProduct, listProducts, removeProduct, singleProduct, updateProduct };