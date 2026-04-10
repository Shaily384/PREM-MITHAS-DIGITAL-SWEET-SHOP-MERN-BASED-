import reviewModel  from "../models/reviewModel.js";
import productModel from "../models/productModel.js";
import userModel    from "../models/userModel.js";

/* ── Add / Update Review ── */
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    // Upsert — one review per user per product
    await reviewModel.findOneAndUpdate(
      { productId, userId },
      { userName: user.name, rating: Number(rating), comment },
      { upsert: true, new: true }
    );

    // Recalculate avg rating on product
    const reviews = await reviewModel.find({ productId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await productModel.findByIdAndUpdate(productId, {
      avgRating:   Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });

    res.json({ success: true, message: "Review submitted! ⭐" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── Get Reviews for a product ── */
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewModel.find({ productId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── Delete review (admin) ── */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    const review = await reviewModel.findByIdAndDelete(reviewId);
    if (!review) return res.json({ success: false, message: "Review not found" });

    // Recalculate
    const reviews = await reviewModel.find({ productId: review.productId });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    await productModel.findByIdAndUpdate(review.productId, {
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};