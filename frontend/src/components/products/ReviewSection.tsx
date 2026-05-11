"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { submitReview, updateReview } from "@/actions/interactions";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

export function ReviewSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: Review[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const existingReview = reviews.find((r) => r.user?.id === session?.user?.id);
  const [isEditing, setIsEditing] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingReview && isEditing) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else if (!existingReview) {
      setRating(5);
      setComment("");
    }
  }, [existingReview, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!session) {
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      if (existingReview) {
        const result = await updateReview(productId, existingReview.id, rating, comment);
        if (!result?.success) {
          setError(result?.error || "Failed to update review");
        } else {
          setIsEditing(false);
          router.refresh();
        }
      } else {
        const result = await submitReview(productId, rating, comment);
        if (!result?.success) {
          setError(result?.error || "Failed to submit review");
        } else {
          setComment("");
          setRating(5);
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="mt-16 pt-12 border-t border-primary-100/10 dark:border-navy-500/30">
      <h2 className="font-heading text-2xl font-bold mb-8">
        Customer <span className="gradient-text">Reviews</span>
      </h2>

      {/* Review Form / Status */}
      {session ? (
        existingReview && !isEditing ? (
          <div className="mb-12 p-6 glass-card rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-semibold text-lg">Your Review</h3>
              <div className="flex mt-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < existingReview.rating ? "text-warning-500" : "text-navy-200 dark:text-navy-600"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-navy-500 dark:text-navy-300 text-sm line-clamp-2">{existingReview.comment}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="btn-secondary whitespace-nowrap">
              Edit Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-12 glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-lg">
                {existingReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              {existingReview && isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-navy-400 hover:text-navy-600 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-navy-400 dark:text-navy-300 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        star <= rating ? "text-warning-500" : "text-navy-200 dark:text-navy-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-navy-400 dark:text-navy-300 mb-2">
                Review
              </label>
              <textarea
                id="comment"
                rows={3}
                required
                minLength={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think about this product?"
                className="input-field w-full"
              />
            </div>

            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
            </button>
          </form>
        )
      ) : (
        <div className="mb-12 p-6 glass-card rounded-2xl flex items-center justify-between">
          <p className="text-navy-400 dark:text-navy-200">Please sign in to leave a review.</p>
          <button onClick={() => router.push("/auth/login")} className="btn-secondary">
            Sign In
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-navy-400 dark:text-navy-300 text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-2xl bg-white/40 dark:bg-navy-800/40 border border-primary-100/20 dark:border-navy-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <img src={review.user.image} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-navy-700 flex items-center justify-center text-primary-500 font-bold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-navy-800 dark:text-white">{review.user.name}</h4>
                    <span className="text-xs text-navy-400 dark:text-navy-300">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-warning-500" : "text-navy-200 dark:text-navy-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-navy-500 dark:text-navy-200">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

