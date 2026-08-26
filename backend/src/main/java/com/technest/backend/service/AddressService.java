package com.technest.backend.service;

import com.technest.backend.dto.AddressRequest;
import com.technest.backend.dto.AddressResponse;
import com.technest.backend.entity.Address;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.AddressRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<AddressResponse> getUserAddresses(String email) {
        User user = getUser(email);
        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = getUser(email);

        boolean isFirstAddress = !addressRepository.existsByUserId(user.getId());
        boolean shouldBeDefault = isFirstAddress || request.getIsDefault();

        if (shouldBeDefault && !isFirstAddress) {
            unsetExistingDefaultAddress(user.getId());
        }

        Address address = new Address();
        address.setUser(user);
        mapRequestToEntity(request, address);
        address.setDefault(shouldBeDefault);

        Address savedAddress = addressRepository.save(address);
        return toResponse(savedAddress);
    }

    @Transactional
    public AddressResponse updateAddress(String email, Long id, AddressRequest request) {
        User user = getUser(email);
        Address address = getAddressAndVerifyOwnership(id, user);

        boolean wasDefault = address.isDefault();
        boolean shouldBeDefault = request.getIsDefault();

        if (shouldBeDefault && !wasDefault) {
            unsetExistingDefaultAddress(user.getId());
        }

        mapRequestToEntity(request, address);
        
        // If it was the only default address, we shouldn't allow unsetting it directly unless there's another.
        // But per requirements: "When updating an address with isDefault = true: unset previous... set selected as default"
        // Let's ensure they can't trivially unset the only default if they don't set another, but the simplest is just to respect the request.
        // However, the prompt says "ensure the user never ends up with multiple default addresses".
        // It's safer to just set the flag. If they turn off default, and it's the last one, maybe they have no default.
        // Let's just follow strictly:
        if (wasDefault && !shouldBeDefault) {
            // Unsetting default. Check if there are other addresses to make default?
            // "if another address exists, automatically make one remaining address the new default" - this was for DELETE.
            // But we should probably do it for UPDATE as well if they unset it.
            // Let's find another address to make default.
            address.setDefault(false);
            Address newDefault = addressRepository.findByUserId(user.getId()).stream()
                    .filter(a -> !a.getId().equals(id))
                    .findFirst().orElse(null);
            
            if (newDefault != null) {
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            } else {
                // It's the only address, it must remain default
                address.setDefault(true);
            }
        } else {
            address.setDefault(shouldBeDefault);
        }

        Address updatedAddress = addressRepository.save(address);
        return toResponse(updatedAddress);
    }

    @Transactional
    public void deleteAddress(String email, Long id) {
        User user = getUser(email);
        Address address = getAddressAndVerifyOwnership(id, user);

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            // Find another address to make default
            List<Address> remainingAddresses = addressRepository.findByUserId(user.getId());
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Address getAddressAndVerifyOwnership(Long id, User user) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to access this address");
        }
        return address;
    }

    private void unsetExistingDefaultAddress(Long userId) {
        List<Address> defaultAddresses = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        for (Address addr : defaultAddresses) {
            addr.setDefault(false);
            addressRepository.save(addr);
        }
    }

    private void mapRequestToEntity(AddressRequest request, Address address) {
        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
    }

    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhoneNumber(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getPostalCode(),
                address.getCountry(),
                address.isDefault()
        );
    }
}
