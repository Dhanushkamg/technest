import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between animate-pulse"
        >
          <div>
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-slate-800/70 rounded-xl mb-4" />

            {/* Category & Badge Skeleton */}
            <div className="flex justify-between items-center mb-2">
              <div className="w-20 h-4 bg-slate-800 rounded" />
              <div className="w-14 h-4 bg-slate-800 rounded" />
            </div>

            {/* Title Skeleton */}
            <div className="w-3/4 h-5 bg-slate-800 rounded mb-2" />
            <div className="w-1/2 h-5 bg-slate-800 rounded mb-4" />

            {/* Rating Skeleton */}
            <div className="w-24 h-4 bg-slate-800 rounded mb-4" />
          </div>

          {/* Footer Price & Button Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <div className="w-24 h-6 bg-slate-800 rounded" />
            <div className="w-10 h-10 bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
