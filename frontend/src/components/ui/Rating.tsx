import React from 'react';
import { Star } from 'lucide-react';

export interface RatingProps {
  rating?: number | null;
  maxRating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Rating: React.FC<RatingProps> = ({
  rating = 0,
  maxRating = 5,
  reviewCount,
  size = 'md',
  interactive = false,
  onRatingChange,
  showText = true,
  className = '',
}) => {
  const currentRating = rating ?? 0;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= currentRating;
          const isHalf = starValue - 0.5 <= currentRating && starValue > currentRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              }`}
              aria-label={`${starValue} out of ${maxRating} stars`}
            >
              <Star
                className={`${sizeMap[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {currentRating > 0 ? currentRating.toFixed(1) : 'No reviews'}
          {reviewCount !== undefined && reviewCount !== null && (
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
              ({reviewCount})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
