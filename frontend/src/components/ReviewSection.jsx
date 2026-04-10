import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const StarPicker = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => !readonly && onChange(n)}
        className={`transition-transform ${readonly ? "cursor-default" : "hover:scale-110 cursor-pointer"}`}>
        <Star className={`w-5 h-5 ${n <= value ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
      </button>
    ))}
  </div>
);

const ReviewSection = ({ productId }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [rating,   setRating]   = useState(5);
  const [comment,  setComment]  = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/review/${productId}`);
      if (data.success) setReviews(data.reviews);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please login to leave a review");
    if (!comment.trim()) return toast.error("Please write a comment");
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${backendUrl}/api/review/add`,
        { productId, rating, comment },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setComment("");
        setRating(5);
        fetchReviews();
      } else toast.error(data.message);
    } catch (e) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const dist = [5,4,3,2,1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
  }));

  return (
    <div className="mt-16 border-t border-stone-100 pt-12">
      <h2 className="text-2xl font-bold text-stone-800 mb-8">Reviews & Ratings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

        {/* Rating Summary */}
        <div className="bg-amber-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-amber-100">
          <p className="text-6xl font-bold text-amber-700">{avg}</p>
          <StarPicker value={Math.round(Number(avg))} readonly />
          <p className="text-sm text-stone-500 mt-2">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-3">
          {dist.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-500 w-3">{star}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 bg-stone-100 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-stone-400 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>

        {/* Write Review */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100">
          <h3 className="font-semibold text-stone-800 mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-stone-400 mb-2">Your Rating</p>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="How was the sweet? Taste, freshness, packaging..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all resize-none"
            />
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-stone-100 animate-pulse">
              <div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-stone-100" /><div className="space-y-2 flex-1"><div className="h-3 w-32 rounded bg-stone-100" /><div className="h-3 w-48 rounded bg-stone-100" /></div></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl">
          <div className="text-4xl mb-3">⭐</div>
          <p className="font-semibold text-stone-700">No reviews yet</p>
          <p className="text-sm text-stone-400 mt-1">Be the first to review this sweet!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                  {review.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-semibold text-stone-800">{review.userName}</p>
                    <p className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                  </div>
                  <StarPicker value={review.rating} readonly />
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;