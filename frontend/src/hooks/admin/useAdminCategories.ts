import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoryAdminApi } from '../../api/admin/categoryAdminApi';
import type { CategoryRequest } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const useAdminCategories = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN';

  const categoriesQuery = useQuery({
    queryKey: ['adminCategories'],
    queryFn: categoryAdminApi.getAllCategories,
    enabled: isAuthenticated && isAdmin,
    staleTime: 1000 * 60 * 5,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryRequest) => categoryAdminApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) =>
      categoryAdminApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated!');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update category.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoryAdminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    },
  });

  return {
    ...categoriesQuery,
    categories: categoriesQuery.data || [],
    createCategory: createCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,
    updateCategory: updateCategoryMutation.mutateAsync,
    isUpdatingCategory: updateCategoryMutation.isPending,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
};

export default useAdminCategories;
