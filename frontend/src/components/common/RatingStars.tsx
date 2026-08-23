import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  showCount = true,
  size = 'sm',
}) => {
  const normalizedRating = Math.max(0, Math.min(5, rating || 0));
  
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = normalizedRating >= starIndex;
          const isHalf = !isFull && normalizedRating >= starIndex - 0.5;

          return (
            <Star
              key={starIndex}
              className={`${iconSizes[size]} ${
                isFull
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          );
        })}
      </div>
      {showCount && (
        <span className={`font-medium text-slate-400 ${textSizes[size]}`}>
          {normalizedRating.toFixed(1)} {reviewCount !== undefined && `(${reviewCount})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
