import express from "express";
import { addReview, getReviews, deleteReview } from "../controllers/reviewController.js";
import authUser  from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add",           authUser,  addReview);
reviewRouter.get("/:productId",               getReviews);
reviewRouter.post("/delete",        adminAuth, deleteReview);

export default reviewRouter;