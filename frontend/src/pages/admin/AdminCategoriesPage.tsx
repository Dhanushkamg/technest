import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useAdminCategories } from '../../hooks/admin/useAdminCategories';
import CategoryFormModal from '../../components/admin/CategoryFormModal';
import type { Category, CategoryRequest } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    isError,
    refetch,
    createCategory,
    isCreatingCategory,
    updateCategory,
    isUpdatingCategory,
    deleteCategory,
  } = useAdminCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CategoryRequest) => {
    if (editingCategory) {
      await updateCategory({ id: editingCategory.id, data });
    } else {
      await createCategory(data);
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-slate-800 rounded mb-4" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Categories</h2>
        <p className="text-slate-400 text-sm mb-6">Could not retrieve category list from admin server.</p>
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
            <Layers className="w-7 h-7 text-cyan-400" /> Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Organize product classification and navigation structure</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No categories found. Create your first category above.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">#{cat.id}</td>
                    <td className="px-6 py-4 font-bold text-white text-sm">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        isLoading={isCreatingCategory || isUpdatingCategory}
      />
    </div>
  );
};

export default AdminCategoriesPage;
