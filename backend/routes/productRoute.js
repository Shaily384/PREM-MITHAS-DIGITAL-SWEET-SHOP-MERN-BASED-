import express from "express";
import { addProduct, listProducts, removeProduct, singleProduct, updateProduct, salesInsights } from "../controllers/productController.js";
import adminAuth from "../middleware/adminAuth.js";
import multer    from "../middleware/multer.js";

const productRouter = express.Router();

productRouter.post("/add",    adminAuth, multer.fields([
  { name:"image1",maxCount:1 }, { name:"image2",maxCount:1 },
  { name:"image3",maxCount:1 }, { name:"image4",maxCount:1 },
]), addProduct);
productRouter.get("/list",             listProducts);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single",          singleProduct);
productRouter.post("/update", adminAuth, updateProduct);
productRouter.get("/insights",adminAuth, salesInsights);  // NEW

export default productRouter;