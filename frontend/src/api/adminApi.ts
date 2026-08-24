import dashboardApi from './admin/dashboardApi';
import productAdminApi from './admin/productAdminApi';
import categoryAdminApi from './admin/categoryAdminApi';
import orderAdminApi from './admin/orderAdminApi';
import couponAdminApi from './admin/couponAdminApi';

export const adminApi = {
  getDashboardStats: dashboardApi.getDashboardStats,
  getAllProducts: productAdminApi.getAllProducts,
  createProduct: productAdminApi.createProduct,
  updateProduct: productAdminApi.updateProduct,
  updateStock: productAdminApi.updateStock,
  adjustStock: productAdminApi.adjustStock,
  deleteProduct: productAdminApi.deleteProduct,
  getAllCategories: categoryAdminApi.getAllCategories,
  createCategory: categoryAdminApi.createCategory,
  updateCategory: categoryAdminApi.updateCategory,
  deleteCategory: categoryAdminApi.deleteCategory,
  getAllOrders: orderAdminApi.getAllOrders,
  updateOrderStatus: orderAdminApi.updateOrderStatus,
  cancelOrder: orderAdminApi.cancelOrder,
  getAllCoupons: couponAdminApi.getAllCoupons,
  getCouponById: couponAdminApi.getCouponById,
  createCoupon: couponAdminApi.createCoupon,
  updateCoupon: couponAdminApi.updateCoupon,
  updateCouponStatus: couponAdminApi.updateCouponStatus,
};

export default adminApi;
