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
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between animate-pulse shadow-sm"
        >
          <div>
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />

            {/* Category Skeleton */}
            <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />

            {/* Title Skeleton */}
            <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="w-1/2 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-4" />

            {/* Rating Skeleton */}
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
          </div>

          {/* Footer Price & Button Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
