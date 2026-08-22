package com.technest.backend.service;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.entity.Address;
import com.technest.backend.entity.Cart;
import com.technest.backend.entity.CartItem;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.AddressRepository;
import com.technest.backend.repository.CartRepository;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceCheckoutTest {

    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartRepository cartRepository;
    @Mock private ProductRepository productRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private com.technest.backend.repository.CouponRepository couponRepository;
    @Mock private NotificationService notificationService;
    @Mock private com.technest.backend.repository.PaymentRepository paymentRepository;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private User otherUser;
    private Cart cart;
    private Product product;
    private Address address;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Electronics");

        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");

        product = new Product();
        product.setId(10L);
        product.setName("Test Product");
        product.setPrice(BigDecimal.valueOf(100));
        product.setStock(5);
        product.setCategory(category);

        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(2);

        cart = new Cart();
        cart.setId(1L);
        cart.setUser(user);
        cart.getItems().add(item);

        address = new Address();
        address.setId(100L);
        address.setUser(user);
        address.setFullName("John Doe");
        address.setPhoneNumber("12345");
        address.setAddressLine1("123 Main St");
        address.setCity("NY");
        address.setPostalCode("10001");
        address.setCountry("USA");
        address.setDefault(true);
    }

    /** Helper: stub findByIdWithLock to return the product (simulates DB lock). */
    private void mockProductLock(Product p) {
        when(productRepository.findByIdWithLock(p.getId())).thenReturn(Optional.of(p));
    }

    // =========================================================
    // Basic checkout flows
    // =========================================================

    @Test
    void checkout_withExplicitAddress_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(99L);
            return o;
        });

        OrderDto result = orderService.checkout("user@example.com", 100L, null);

        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getDeliveryAddress().getFullName()).isEqualTo("John Doe");
        assertThat(result.getDeliveryAddress().getCity()).isEqualTo("NY");
    }

    @Test
    void checkout_withoutAddressId_usesDefaultAddress_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(List.of(address));
        mockProductLock(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(99L);
            return o;
        });

        OrderDto result = orderService.checkout("user@example.com", null, null);

        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getDeliveryAddress().getFullName()).isEqualTo("John Doe");
    }

    @Test
    void checkout_withoutAddressId_noAddressesExist_throwsBadRequest() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.checkout("user@example.com", null, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No delivery address found");
    }

    @Test
    void checkout_withAddressId_addressBelongsToAnotherUser_throwsForbidden() {
        address.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, null))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("permission");
    }

    @Test
    void checkout_withAddressId_addressNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 999L, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Address not found");
    }

    // =========================================================
    // Stock validation at checkout
    // =========================================================

    @Test
    void checkout_insufficientStock_throwsBadRequest_noStockReduced() {
        product.setStock(1); // Only 1 in stock, cart requests 2

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");

        // Stock must not be reduced
        assertThat(product.getStock()).isEqualTo(1);
        verify(orderRepository, never()).save(any(Order.class));
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void checkout_exactStock_succeeds_andReducesStockToZero() {
        product.setStock(2); // Exactly what cart requests

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        orderService.checkout("user@example.com", 100L, null);

        assertThat(product.getStock()).isEqualTo(0);
        verify(productRepository).save(product);
    }

    @Test
    void checkout_success_stockReducedCorrectly() {
        // product has stock=5, cart item quantity=2 => stock should be 3 after
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        orderService.checkout("user@example.com", 100L, null);

        assertThat(product.getStock()).isEqualTo(3);
        verify(productRepository).save(product);
    }

    @Test
    void checkout_multipleItems_allStockReducedCorrectly() {
        Category category = new Category();
        category.setId(2L);
        category.setName("Electronics");

        Product product2 = new Product();
        product2.setId(20L);
        product2.setName("Second Product");
        product2.setPrice(BigDecimal.valueOf(50));
        product2.setStock(10);
        product2.setCategory(category);

        CartItem item2 = new CartItem();
        item2.setProduct(product2);
        item2.setQuantity(3);
        cart.getItems().add(item2);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        when(productRepository.findByIdWithLock(10L)).thenReturn(Optional.of(product));
        when(productRepository.findByIdWithLock(20L)).thenReturn(Optional.of(product2));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        orderService.checkout("user@example.com", 100L, null);

        assertThat(product.getStock()).isEqualTo(3);  // 5 - 2
        assertThat(product2.getStock()).isEqualTo(7); // 10 - 3
    }

    @Test
    void checkout_multipleItems_oneInsufficientStock_noStockReducedAtAll() {
        Category category = new Category();
        category.setId(2L);
        category.setName("Electronics");

        Product product2 = new Product();
        product2.setId(20L);
        product2.setName("Out-of-stock Item");
        product2.setPrice(BigDecimal.valueOf(50));
        product2.setStock(1); // Only 1 available
        product2.setCategory(category);

        CartItem item2 = new CartItem();
        item2.setProduct(product2);
        item2.setQuantity(5); // Requesting 5
        cart.getItems().add(item2);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        // Both products are locked; second one fails validation
        when(productRepository.findByIdWithLock(10L)).thenReturn(Optional.of(product));
        when(productRepository.findByIdWithLock(20L)).thenReturn(Optional.of(product2));

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");

        // Neither product's stock should have changed (validate-all-before-reduce)
        assertThat(product.getStock()).isEqualTo(5);
        assertThat(product2.getStock()).isEqualTo(1);
        verify(productRepository, never()).save(any(Product.class));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void checkout_insufficientStock_cartNotCleared() {
        product.setStock(1);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, null))
                .isInstanceOf(BadRequestException.class);

        // Cart must NOT have been cleared
        verify(cartRepository, never()).save(any(Cart.class));
        assertThat(cart.getItems()).isNotEmpty();
    }

    @Test
    void checkout_usesLockingMechanism_findByIdWithLockCalled() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        orderService.checkout("user@example.com", 100L, null);

        // Must use the locking query, NOT plain findById
        verify(productRepository).findByIdWithLock(eq(10L));
        verify(productRepository, never()).findById(10L);
    }

    // =========================================================
    // Coupon tests
    // =========================================================

    @Test
    void checkout_withValidPercentageCoupon_appliesDiscount() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        com.technest.backend.entity.Coupon coupon = new com.technest.backend.entity.Coupon();
        coupon.setCode("SAVE10");
        coupon.setActive(true);
        coupon.setDiscountType(com.technest.backend.entity.DiscountType.PERCENTAGE);
        coupon.setDiscountValue(BigDecimal.valueOf(10)); // 10%
        coupon.setUsageCount(0);

        when(couponRepository.findByCodeWithLock("SAVE10")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.checkout("user@example.com", 100L, "SAVE10");

        assertThat(result.getSubtotal()).isEqualByComparingTo(BigDecimal.valueOf(200)); // 2 * 100
        assertThat(result.getDiscountAmount()).isEqualByComparingTo(BigDecimal.valueOf(20)); // 10% of 200
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(180));
        assertThat(result.getCouponCode()).isEqualTo("SAVE10");
        assertThat(coupon.getUsageCount()).isEqualTo(1);
    }

    @Test
    void checkout_withValidFixedAmountCoupon_appliesDiscount() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        com.technest.backend.entity.Coupon coupon = new com.technest.backend.entity.Coupon();
        coupon.setCode("MINUS50");
        coupon.setActive(true);
        coupon.setDiscountType(com.technest.backend.entity.DiscountType.FIXED_AMOUNT);
        coupon.setDiscountValue(BigDecimal.valueOf(50));
        coupon.setUsageCount(0);

        when(couponRepository.findByCodeWithLock("MINUS50")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.checkout("user@example.com", 100L, "MINUS50");

        assertThat(result.getSubtotal()).isEqualByComparingTo(BigDecimal.valueOf(200));
        assertThat(result.getDiscountAmount()).isEqualByComparingTo(BigDecimal.valueOf(50));
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(150));
        assertThat(result.getCouponCode()).isEqualTo("MINUS50");
        assertThat(coupon.getUsageCount()).isEqualTo(1);
    }

    @Test
    void checkout_withFixedAmountExceedingSubtotal_capsDiscountToSubtotal() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        com.technest.backend.entity.Coupon coupon = new com.technest.backend.entity.Coupon();
        coupon.setCode("MINUS500");
        coupon.setActive(true);
        coupon.setDiscountType(com.technest.backend.entity.DiscountType.FIXED_AMOUNT);
        coupon.setDiscountValue(BigDecimal.valueOf(500));
        coupon.setUsageCount(0);

        when(couponRepository.findByCodeWithLock("MINUS500")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.checkout("user@example.com", 100L, "MINUS500");

        assertThat(result.getSubtotal()).isEqualByComparingTo(BigDecimal.valueOf(200));
        assertThat(result.getDiscountAmount()).isEqualByComparingTo(BigDecimal.valueOf(200)); // Capped
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(0));
    }

    @Test
    void checkout_withInactiveCoupon_throwsBadRequest() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        com.technest.backend.entity.Coupon coupon = new com.technest.backend.entity.Coupon();
        coupon.setCode("INACTIVE");
        coupon.setActive(false);

        when(couponRepository.findByCodeWithLock("INACTIVE")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, "INACTIVE"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not active");
    }

    @Test
    void checkout_withUsageLimitReached_throwsBadRequest() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        com.technest.backend.entity.Coupon coupon = new com.technest.backend.entity.Coupon();
        coupon.setCode("LIMITED");
        coupon.setActive(true);
        coupon.setMaxUsageLimit(10);
        coupon.setUsageCount(10); // Limit reached

        when(couponRepository.findByCodeWithLock("LIMITED")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, "LIMITED"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("limit reached");
    }

    @Test
    void checkout_insufficientStock_couponUsageNotIncremented() {
        product.setStock(1); // Not enough stock

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        mockProductLock(product);

        // No coupon repo mock needed — we never reach coupon processing

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L, "ANYCOUPON"))
                .isInstanceOf(BadRequestException.class);

        // Coupon repo should not have been queried
        verify(couponRepository, never()).findByCodeWithLock(any());
    }
}
