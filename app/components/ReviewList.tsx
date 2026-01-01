"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { websocketService, ReviewData } from "@/lib/websocket";

interface Review {
  id: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
  user_id: string | null;
  user_avatar: string | null;
}

interface ReviewListProps {
  productId: number;
  refreshTrigger?: number;
}

export function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    console.log(` ReviewList useEffect triggered for product ${productId}`);
    fetchReviews();

    // Join WebSocket room for this product
    console.log(` Attempting to join WebSocket room for product ${productId}`);
    websocketService.joinProductRoom(productId);

    // Listen for real-time review updates
    const handleReviewAdded = (data: { productId: number; review: ReviewData; timestamp: string }) => {
      console.log(' New review received in real-time:', data);

      if (data.productId === productId) {
        console.log(' Review matches current product, updating UI');

        // Add the new review to the beginning of the list
        setReviews(prevReviews => {
          const newReview: Review = {
            id: data.review.id,
            rating: data.review.rating,
            comment: data.review.comment,
            created_at: data.review.created_at,
            user_id: data.review.user_id,
            user_avatar: data.review.user_avatar
          };

          const updatedReviews = [newReview, ...prevReviews];
          console.log(' Updated reviews list:', updatedReviews);

          // Recalculate average rating
          const validRatings = updatedReviews.filter(r => r.rating !== null);
          if (validRatings.length > 0) {
            const avg = validRatings.reduce((sum, review) => sum + (review.rating || 0), 0) / validRatings.length;
            setAverageRating(Math.round(avg * 10) / 10);
            console.log(' New average rating:', Math.round(avg * 10) / 10);
          } else {
            setAverageRating(0);
          }

          return updatedReviews;
        });

        // Show notification for new review
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Review Baru!', {
              body: `${data.review.user_id?.charAt(0).toUpperCase() || 'User'} memberikan review ${data.review.rating} bintang`,
              icon: '/favicon.ico'
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Review Baru!', {
                  body: `${data.review.user_id?.charAt(0).toUpperCase() || 'User'} memberikan review ${data.review.rating} bintang`,
                  icon: '/favicon.ico'
                });
              }
            });
          }
        }
      } else {
        console.log(` Review for product ${data.productId} doesn't match current product ${productId}`);
      }
    };

    console.log(' Registering review-added event listener');
    websocketService.onReviewAdded(handleReviewAdded);

    // Cleanup
    return () => {
      console.log(` Cleaning up WebSocket room for product ${productId}`);
      websocketService.leaveProductRoom(productId);
      websocketService.offReviewAdded(handleReviewAdded);
    };
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews_with_user')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data || []);
        
        // Calculate average rating
        if (data && data.length > 0) {
          const validRatings = data.filter(r => r.rating !== null);
          if (validRatings.length > 0) {
            const avg = validRatings.reduce((sum, review) => sum + (review.rating || 0), 0) / validRatings.length;
            setAverageRating(Math.round(avg * 10) / 10);
          } else {
            setAverageRating(0);
          }
        } else {
          setAverageRating(0);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number | null) => {
    const safeRating = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-4 h-4"
            style={{
              fill: star <= safeRating ? '#fbbf24' : 'none',
              color: star <= safeRating ? '#fbbf24' : 'var(--text-muted)'
            }}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-4 p-4 rounded-lg border" style={{ 
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--border-primary)'
      }}>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
            {averageRating}
          </div>
          {renderStars(Math.round(averageRating))}
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => r.rating !== null && r.rating === star).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8" style={{ color: 'var(--text-secondary)' }}>
                    {star}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ 
                    backgroundColor: 'var(--border-muted)' 
                  }}>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: '#fbbf24'
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada review untuk produk ini</p>
            <p className="text-sm">Jadilah yang pertama memberikan review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.id}
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ 
                    backgroundColor: 'var(--border-muted)' 
                  }}>
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ 
                        backgroundColor: 'var(--accent)',
                        color: 'var(--text-inverse)'
                      }}>
                        <span className="text-sm font-bold">
                          {review.user_id ? review.user_id.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {review.comment}
                    </p>
                  )}
                  
                  {!review.comment && (
                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                      Pengguna tidak memberikan komentar
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
