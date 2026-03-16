import express from 'express';
import { 
    addProduct, 
    listProducts, 
    removeProduct, 
    singleProduct, 
    updateProduct 
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Route for Adding Product (Handles 4 images)
productRouter.post('/add', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), addProduct);

// Route for Listing Products
productRouter.get('/list', listProducts);

// Route for Removing Product
productRouter.post('/remove', adminAuth, removeProduct);

// Route for Single Product Info
productRouter.post('/single', singleProduct);

// Route for Updating Product
productRouter.post('/update', adminAuth, updateProduct);

export default productRouter;