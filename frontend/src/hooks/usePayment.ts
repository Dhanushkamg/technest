import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../api/paymentApi';
import type { CreatePaymentRequest, PaymentConfirmRequest } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export const usePayment = (orderId?: number) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch payments for an order
  const paymentsQuery = useQuery({
    queryKey: ['payments', orderId],
    queryFn: () => paymentApi.getPaymentsByOrderId(orderId!),
    enabled: isAuthenticated && !!orderId && !isNaN(orderId),
    staleTime: 1000 * 60 * 2,
  });

  // Direct create payment (1-step)
  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Initiate payment (2-step)
  const initiatePaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.initiatePayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.orderId] });
    },
  });

  // Confirm payment (2-step)
  const confirmPaymentMutation = useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: number; data: PaymentConfirmRequest }) =>
      paymentApi.confirmPayment(paymentId, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payments', payment.orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', payment.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    ...paymentsQuery,
    payments: paymentsQuery.data,
    createPayment: createPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending,
    initiatePayment: initiatePaymentMutation.mutateAsync,
    isInitiatingPayment: initiatePaymentMutation.isPending,
    confirmPayment: confirmPaymentMutation.mutateAsync,
    isConfirmingPayment: confirmPaymentMutation.isPending,
  };
};

export default usePayment;
