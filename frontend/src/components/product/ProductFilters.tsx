import React from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Star,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import type { Category, ProductQueryParams } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  filters: ProductQueryParams;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (updated: Partial<ProductQueryParams>) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedBrand?: string;
  onBrandChange?: (brand?: string) => void;
}

const COMMON_BRANDS = ['Apple', 'ASUS', 'Sony', 'Dell', 'Samsung', 'Logitech', 'Razer', 'Corsair'];

const PRICE_PRESETS = [
  { label: 'Under $100', min: undefined, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000+', min: 1000, max: undefined },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  searchInput,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  selectedBrand,
  onBrandChange,
}) => {
  const isFiltered =
    !!searchInput ||
    !!filters.categoryId ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    !!filters.minRating ||
    !!selectedBrand ||
    (filters.sortBy && filters.sortBy !== 'id');

  const handlePricePreset = (min?: number, max?: number) => {
    onFilterChange({ minPrice: min, maxPrice: max, page: 0 });
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm space-y-5">
      {/* Top Row: Search, Sort Selector & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search catalog by product name, model, hardware..."
            className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-brand-500 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm transition-all outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Group */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-shrink-0">
          {/* Sort Selector */}
          <div className="flex items-center gap-2 flex-1 lg:flex-initial">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={`${filters.sortBy || 'id'}-${filters.sortDir || 'asc'}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split('-');
                onFilterChange({ sortBy, sortDir: sortDir as 'asc' | 'desc', page: 0 });
              }}
              className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:border-brand-500 outline-none cursor-pointer"
            >
              <option value="id-asc">Featured / Default</option>
              <option value="createdAt-desc">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="averageRating-desc">Highest Rated</option>
              <option value="reviewCount-desc">Most Popular / Best Sellers</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex-shrink-0">
            <button
              type="button"
              aria-label="Grid View"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="List View"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Category Pills */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
          Categories:
        </span>
        <button
          type="button"
          onClick={() => onFilterChange({ categoryId: undefined, page: 0 })}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            !filters.categoryId
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const isSelected = filters.categoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFilterChange({ categoryId: isSelected ? undefined : cat.id, page: 0 })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Third Row: Brand Filters */}
      {onBrandChange && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Brands:
          </span>
          <button
            type="button"
            onClick={() => onBrandChange(undefined)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !selectedBrand
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Brands
          </button>
          {COMMON_BRANDS.map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onBrandChange(isSelected ? undefined : brand)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      )}

      {/* Fourth Row: Price Presets, Min/Max Inputs, Rating & Reset */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Price Controls & Presets */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Price:</span>
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
              className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-brand-500 outline-none"
            />
            <span className="text-slate-400">-</span>
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
              className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-brand-500 outline-none"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePricePreset(preset.min, preset.max)}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter & Reset Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rating:
            </span>
            <select
              value={filters.minRating || 0}
              onChange={(e) =>
                onFilterChange({
                  minRating: Number(e.target.value) || undefined,
                  page: 0,
                })
              }
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:border-brand-500 outline-none cursor-pointer"
            >
              <option value="0">All Ratings</option>
              <option value="4">4.0+ Stars</option>
              <option value="3">3.0+ Stars</option>
              <option value="2">2.0+ Stars</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
