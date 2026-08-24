import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productAdminApi } from '../../api/admin/productAdminApi';
import type { ProductRequest } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const useAdminProducts = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN';

  const productsQuery = useQuery({
    queryKey: ['adminProducts'],
    queryFn: productAdminApi.getAllProducts,
    enabled: isAuthenticated && isAdmin,
    staleTime: 1000 * 60 * 2,
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductRequest) => productAdminApi.createProduct(data),
    onSuccess: () => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product.');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) =>
      productAdminApi.updateProduct(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product.');
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      productAdminApi.updateStock(id, stock),
    onSuccess: () => {
      toast.success('Stock level updated!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update stock.');
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, adjustment }: { id: number; adjustment: number }) =>
      productAdminApi.adjustStock(id, adjustment),
    onSuccess: () => {
      toast.success('Stock adjusted!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to adjust stock.');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productAdminApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    },
  });

  return {
    ...productsQuery,
    products: productsQuery.data || [],
    createProduct: createProductMutation.mutateAsync,
    isCreatingProduct: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    isUpdatingProduct: updateProductMutation.isPending,
    updateStock: updateStockMutation.mutateAsync,
    isUpdatingStock: updateStockMutation.isPending,
    adjustStock: adjustStockMutation.mutateAsync,
    isAdjustingStock: adjustStockMutation.isPending,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeletingProduct: deleteProductMutation.isPending,
  };
};

export default useAdminProducts;
