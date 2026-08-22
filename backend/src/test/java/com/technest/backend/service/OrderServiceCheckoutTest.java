package com.technest.backend.service;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.entity.Address;
import com.technest.backend.entity.Cart;
import com.technest.backend.entity.CartItem;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceCheckoutTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private AddressRepository addressRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private User otherUser;
    private Cart cart;
    private Product product;
    private Address address;

    @BeforeEach
    void setUp() {
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

    @Test
    void checkout_withExplicitAddress_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(99L);
            return o;
        });

        OrderDto result = orderService.checkout("user@example.com", 100L);

        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getDeliveryAddress().getFullName()).isEqualTo("John Doe");
        assertThat(result.getDeliveryAddress().getCity()).isEqualTo("NY");
    }

    @Test
    void checkout_withoutAddressId_usesDefaultAddress_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(List.of(address));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(99L);
            return o;
        });

        OrderDto result = orderService.checkout("user@example.com", null);

        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getDeliveryAddress().getFullName()).isEqualTo("John Doe");
    }

    @Test
    void checkout_withoutAddressId_noAddressesExist_throwsBadRequest() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.checkout("user@example.com", null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No delivery address found");
    }

    @Test
    void checkout_withAddressId_addressBelongsToAnotherUser_throwsForbidden() {
        address.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 100L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("permission");
    }

    @Test
    void checkout_withAddressId_addressNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(addressRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.checkout("user@example.com", 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Address not found");
    }
}
