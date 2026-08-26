package com.technest.backend.service;

import com.technest.backend.dto.AddressRequest;
import com.technest.backend.dto.AddressResponse;
import com.technest.backend.entity.Address;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.AddressRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressService addressService;

    private User user1;
    private User user2;
    private Address address1;
    private AddressRequest addressRequest;

    @BeforeEach
    void setUp() {
        user1 = new User();
        user1.setId(1L);
        user1.setEmail("user1@test.com");

        user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@test.com");

        address1 = new Address();
        address1.setId(100L);
        address1.setUser(user1);
        address1.setFullName("John Doe");
        address1.setPhoneNumber("123456789");
        address1.setAddressLine1("123 Main St");
        address1.setCity("NY");
        address1.setPostalCode("10001");
        address1.setCountry("USA");
        address1.setDefault(true);

        addressRequest = new AddressRequest();
        addressRequest.setFullName("Jane Doe");
        addressRequest.setPhoneNumber("987654321");
        addressRequest.setAddressLine1("456 Broad St");
        addressRequest.setCity("LA");
        addressRequest.setPostalCode("90001");
        addressRequest.setCountry("USA");
        addressRequest.setIsDefault(true);
    }

    // ==========================================
    // CREATE
    // ==========================================

    @Test
    void addAddress_firstAddress_automaticallyDefault() {
        when(userRepository.findByEmail("user1@test.com")).thenReturn(Optional.of(user1));
        when(addressRepository.existsByUserId(1L)).thenReturn(false);
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

        addressRequest.setIsDefault(false); // Even if false, it should be forced to true
        AddressResponse response = addressService.addAddress("user1@test.com", addressRequest);

        assertThat(response.isDefault()).isTrue();
        verify(addressRepository, never()).findByUserIdAndIsDefaultTrue(anyLong());
    }

    @Test
    void addAddress_newDefault_unsetsOldDefault() {
        when(userRepository.findByEmail("user1@test.com")).thenReturn(Optional.of(user1));
        when(addressRepository.existsByUserId(1L)).thenReturn(true);
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(List.of(address1));
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

        addressRequest.setIsDefault(true);
        AddressResponse response = addressService.addAddress("user1@test.com", addressRequest);

        assertThat(response.isDefault()).isTrue();
        assertThat(address1.isDefault()).isFalse(); // old default was unset
        verify(addressRepository).save(address1); // saved old address with isDefault=false
    }

    // ==========================================
    // UPDATE
    // ==========================================

    @Test
    void updateAddress_anotherUsersAddress_throwsForbidden() {
        when(userRepository.findByEmail("user2@test.com")).thenReturn(Optional.of(user2));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address1)); // belongs to user1

        assertThatThrownBy(() -> addressService.updateAddress("user2@test.com", 100L, addressRequest))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void updateAddress_makeDefault_unsetsOldDefault() {
        Address oldDefault = new Address();
        oldDefault.setId(101L);
        oldDefault.setDefault(true);
        oldDefault.setUser(user1);

        address1.setDefault(false); // Current address is not default

        when(userRepository.findByEmail("user1@test.com")).thenReturn(Optional.of(user1));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address1));
        when(addressRepository.findByUserIdAndIsDefaultTrue(1L)).thenReturn(List.of(oldDefault));
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

        addressRequest.setIsDefault(true);
        AddressResponse response = addressService.updateAddress("user1@test.com", 100L, addressRequest);

        assertThat(response.isDefault()).isTrue();
        assertThat(oldDefault.isDefault()).isFalse();
    }

    // ==========================================
    // DELETE
    // ==========================================

    @Test
    void deleteAddress_anotherUsersAddress_throwsForbidden() {
        when(userRepository.findByEmail("user2@test.com")).thenReturn(Optional.of(user2));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address1));

        assertThatThrownBy(() -> addressService.deleteAddress("user2@test.com", 100L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void deleteAddress_defaultAddress_makesAnotherDefault() {
        Address address2 = new Address();
        address2.setId(102L);
        address2.setDefault(false);

        when(userRepository.findByEmail("user1@test.com")).thenReturn(Optional.of(user1));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address1)); // address1 is default
        when(addressRepository.findByUserId(1L)).thenReturn(List.of(address2)); // another address exists

        addressService.deleteAddress("user1@test.com", 100L);

        verify(addressRepository).delete(address1);
        assertThat(address2.isDefault()).isTrue(); // address2 became default
        verify(addressRepository).save(address2);
    }
}
