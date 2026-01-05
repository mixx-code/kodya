"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { websocketService } from "@/lib/websocket";
import { showNotification } from "./Notification";

interface ReviewFormProps {
  orderId: string;
  productId: number;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ orderId, productId, onReviewSubmitted }: ReviewFormProps) {
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      showNotification({
        message: 'Silakan pilih rating terlebih dahulu',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showNotification({
          message: 'User tidak ditemukan',
          type: 'error'
        });
        return;
      }

      // Validate input data
      console.log('Submitting review with data:', {
        orderId,
        productId,
        userId: user.id,
        rating,
        comment: comment.trim() || null
      });

      if (!orderId || !productId || !user.id || rating < 1 || rating > 5) {
        console.error('Invalid data:', { orderId, productId, userId: user.id, rating });
        showNotification({
          message: 'Data tidak valid. Silakan coba lagi.',
          type: 'error'
        });
        return;
      }

      const reviewData = {
        order_id: orderId.toString(), // Ensure string
        product_id: Number(productId), // Ensure number
        user_id: user.id.toString(), // Ensure string
        rating: Number(rating), // Ensure number
        comment: comment.trim() || null,
      };

      console.log('Review data to insert:', reviewData);

      const { error, data } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select();

      console.log('Review submission result:', { data, error });

      if (error) {
        console.error('Error submitting review:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        showNotification({
          message: `Gagal mengirim review: ${error.message || 'Unknown error'}`,
          type: 'error'
        });
      } else {
        // Send real-time notification via WebSocket
        if (data && data.length > 0) {
          const newReview = data[0];

          // Fetch user data for the review
          const { data: userData } = await supabase.auth.getUser();

          const reviewWithUser = {
            id: newReview.id,
            rating: newReview.rating,
            comment: newReview.comment,
            created_at: newReview.created_at || new Date().toISOString(),
            user_id: userData.user?.id || '',
            user_avatar: userData.user?.user_metadata?.avatar_url || null,
            product_id: productId
          };

          // Notify other clients about the new review
          websocketService.notifyNewReview(productId, reviewWithUser);
        }

        showNotification({
          message: 'Review berhasil dikirim!',
          type: 'success'
        });
        setRating(0);
        setComment("");
        onReviewSubmitted?.();
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification({
        message: 'Terjadi kesalahan',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-1 transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <Star
                className="w-6 h-6 transition-colors"
                style={{
                  fill: (hoveredStar ? star <= hoveredStar : star <= rating) 
                    ? '#fbbf24' 
                    : 'none',
                  color: (hoveredStar ? star <= hoveredStar : star <= rating)
                    ? '#fbbf24'
                    : 'var(--text-muted)'
                }}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {rating === 1 && 'Sangat Buruk'}
            {rating === 2 && 'Buruk'}
            {rating === 3 && 'Cukup'}
            {rating === 4 && 'Baik'}
            {rating === 5 && 'Sangat Baik'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Komentar (Opsional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          className="w-full p-3 rounded-lg border resize-none transition-colors"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          rows={3}
          disabled={isSubmitting}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {comment.length}/500 karakter
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isSubmitting || rating === 0 ? 'var(--border-muted)' : 'var(--accent)',
          color: 'var(--text-inverse)'
        }}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Mengirim...
          </div>
        ) : (
          'Kirim Review'
        )}
      </button>
    </form>
  );
}
