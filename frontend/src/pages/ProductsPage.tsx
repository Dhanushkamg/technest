import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, RotateCcw, AlertTriangle, Cpu } from 'lucide-react';
import type { ProductQueryParams } from '../types';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { useDebounce } from '../hooks/useDebounce';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import ProductSkeleton from '../components/product/ProductSkeleton';
import Pagination from '../components/common/Pagination';

export const ProductsPage: React.FC = () => {
  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [filters, setFilters] = useState<ProductQueryParams>({
    page: 0,
    size: 12,
    sortBy: 'id',
    sortDir: 'asc',
  });

  // Combine debounced search with query params
  const activeParams: ProductQueryParams = {
    ...filters,
    search: debouncedSearch || undefined,
  };

  // Fetch categories query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch products query
  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', activeParams],
    queryFn: () => productApi.getProducts(activeParams),
    staleTime: 1000 * 60 * 2,
  });

  const handleFilterChange = (updated: Partial<ProductQueryParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      page: 0,
      size: 12,
      sortBy: 'id',
      sortDir: 'asc',
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const products = pagedData?.content || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 0;
  const currentPage = pagedData?.page ?? filters.page ?? 0;
  const pageSize = pagedData?.size ?? filters.size ?? 12;
  const isFirst = pagedData?.first ?? true;
  const isLast = pagedData?.last ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" /> High Performance Hardware
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Product <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Catalog</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse our curated selection of flagship electronics, gadgets, and computing systems.
          </p>
        </div>

        {totalElements > 0 && !isLoading && (
          <div className="text-sm text-slate-400 font-medium bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
            Showing <span className="text-cyan-400 font-bold">{totalElements}</span> items
          </div>
        )}
      </div>

      {/* Product Filters Component */}
      <ProductFilters
        categories={categories}
        filters={filters}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Loading UX: Skeletons */}
      {isLoading && <ProductSkeleton count={filters.size || 12} />}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="bg-slate-900/80 border border-rose-800/50 rounded-2xl p-12 text-center my-10 max-w-lg mx-auto backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Products</h3>
          <p className="text-slate-400 text-sm mb-6">
            {(error as Error)?.message || 'Unable to connect to the Spring Boot ecommerce API server.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-16 text-center my-8 max-w-md mx-auto backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
          <p className="text-slate-400 text-sm mb-6">
            We couldn't find any products matching your current filters or search query.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Filters
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <>
          <ProductGrid products={products} />

          {/* Backend Pagination */}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            first={isFirst}
            last={isLast}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ProductsPage;
