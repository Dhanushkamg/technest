import React, { useState } from 'react';

import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCcw,
  Sliders,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { useAdminCategories } from '../../hooks/admin/useAdminCategories';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { getProductImage } from '../../utils/productImages';
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
    updateStock,
    deleteProduct,
  } = useAdminProducts();

  const { categories } = useAdminCategories();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Stock Edit State
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);

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

  const handleStockUpdateSave = async (id: number) => {
    await updateStock({ id, stock: stockInput });
    setEditingStockId(null);
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/50">
          <XCircle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50">
          <AlertCircle className="w-3 h-3" /> Low ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
        <CheckCircle className="w-3 h-3" /> In Stock ({stock})
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-slate-800 rounded mb-4" />
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Products</h2>
        <p className="text-slate-400 text-sm mb-6">Could not retrieve product list from admin server.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-cyan-400" /> Product Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage catalog, pricing, and live inventory stock</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 outline-none"
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
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const imgUrl = getProductImage(p);
                  const isStockEditing = editingStockId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Product Name & Image */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/60 flex-shrink-0">
                            <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">ID: #{p.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-3.5 text-slate-300 font-medium">
                        {p.categoryName || 'Uncategorized'}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-3.5 font-bold text-white text-sm">
                        ${Number(p.price).toFixed(2)}
                      </td>

                      {/* Stock Status / Inline Edit */}
                      <td className="px-6 py-3.5">
                        {isStockEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockInput}
                              onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-slate-950 border border-cyan-500 rounded text-white text-xs"
                            />
                            <button
                              onClick={() => handleStockUpdateSave(p.id)}
                              className="px-2 py-1 bg-cyan-500 text-white rounded text-[11px] font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getStockBadge(p.stock)}
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setStockInput(p.stock);
                              }}
                              className="text-[10px] text-cyan-400 hover:underline font-semibold"
                            >
                              Quick Edit
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
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
    </div>
  );
};

export default AdminProductsPage;
