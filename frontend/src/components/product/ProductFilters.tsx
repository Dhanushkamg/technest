import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, Filter, Star } from 'lucide-react';
import type { Category, ProductQueryParams } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  filters: ProductQueryParams;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (updated: Partial<ProductQueryParams>) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  searchInput,
  onSearchChange,
  onFilterChange,
  onResetFilters,
}) => {
  const isFiltered =
    !!searchInput ||
    !!filters.categoryId ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    !!filters.minRating ||
    filters.sortBy !== 'id';

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 mb-8 shadow-xl backdrop-blur-xl space-y-5">
      {/* Top Row: Search Input & Sort Selector */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name or specification..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 placeholder-slate-500 text-sm transition-all outline-none"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Sort by:
          </label>
          <select
            value={`${filters.sortBy || 'id'}-${filters.sortDir || 'asc'}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split('-');
              onFilterChange({ sortBy, sortDir: sortDir as 'asc' | 'desc', page: 0 });
            }}
            className="w-full md:w-56 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 text-slate-200 text-sm font-medium transition-all outline-none cursor-pointer"
          >
            <option value="id-asc">Featured / Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="averageRating-desc">Highest Rated</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="createdAt-desc">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Second Row: Category Pills & Price / Rating Filters */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Category:
          </span>
          <button
            onClick={() => onFilterChange({ categoryId: undefined, page: 0 })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filters.categoryId
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ categoryId: isSelected ? undefined : cat.id, page: 0 })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Price & Rating Controls + Reset Button */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Price Range */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Price:</span>
            <input
              type="number"
              min="0"
              placeholder="Min $"
              value={filters.minPrice || ''}
              onChange={(e) =>
                onFilterChange({
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                  page: 0,
                })
              }
              className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
            <span className="text-slate-600">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max $"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onFilterChange({
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  page: 0,
                })
              }
              className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Min Rating */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Rating:
            </span>
            <select
              value={filters.minRating || 0}
              onChange={(e) =>
                onFilterChange({
                  minRating: Number(e.target.value) || undefined,
                  page: 0,
                })
              }
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 outline-none cursor-pointer"
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          {/* Clear / Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/40 transition-colors ml-auto lg:ml-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
