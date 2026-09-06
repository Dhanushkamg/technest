import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sliders,
  CheckCircle,
  AlertCircle,
  XCircle,
  History,
  TrendingUp,
} from 'lucide-react';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { useAdminCategories } from '../../hooks/admin/useAdminCategories';
import ProductFormModal from '../../components/admin/ProductFormModal';
import StockAdjustModal from '../../components/admin/StockAdjustModal';
import ProductMovementsModal from '../../components/admin/ProductMovementsModal';
import { getProductImage } from '../../utils/productImages';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import type { Product, ProductRequest } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    isError,
    refetch,
    createProduct,
    isCreatingProduct,
    updateProduct,
    isUpdatingProduct,
    deleteProduct,
  } = useAdminProducts();

  const { categories } = useAdminCategories();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock Adjust & Movement History Modals
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ProductRequest) => {
    if (editingProduct) {
      await updateProduct({ id: editingProduct.id, data });
    } else {
      await createProduct(data);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || String(p.categoryId) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/50">
          <XCircle className="w-3 h-3" /> Out of Stock (0)
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800/50">
          <AlertCircle className="w-3 h-3" /> Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/50">
        <CheckCircle className="w-3 h-3" /> In Stock ({stock})
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20 p-4">
        <ErrorState
          title="Failed to Load Products"
          description="Could not retrieve product list from admin server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-brand-500 dark:text-brand-400" /> Product Inventory Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage catalog, transactional stock adjustments, and inventory movement history
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Add Product
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <EmptyState
                      title="No Products Found"
                      description="No products matched your search or category criteria."
                    />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imgUrl = getProductImage(p);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Product Name & Image */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
                            <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: #{p.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {p.categoryName || 'Uncategorized'}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        ${Number(p.price).toFixed(2)}
                      </td>

                      {/* Stock Status & Quick Adjustment Actions */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStockBadge(p.stock)}
                          <button
                            onClick={() => setAdjustingProduct(p)}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40 rounded-lg hover:bg-brand-100 transition flex items-center gap-1"
                            title="Adjust Stock"
                          >
                            <TrendingUp className="w-3 h-3" /> Adjust
                          </button>
                          <button
                            onClick={() => setHistoryProduct(p)}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
                            title="View Movement History"
                          >
                            <History className="w-3 h-3" /> Audit
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        product={editingProduct}
        isLoading={isCreatingProduct || isUpdatingProduct}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={adjustingProduct !== null}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />

      {/* Product Movements Modal */}
      <ProductMovementsModal
        isOpen={historyProduct !== null}
        onClose={() => setHistoryProduct(null)}
        product={historyProduct}
      />

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Product?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
