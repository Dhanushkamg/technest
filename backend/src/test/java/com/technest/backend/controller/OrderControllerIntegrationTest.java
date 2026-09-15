package com.technest.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.technest.backend.config.IntegrationTestConfig;
import com.technest.backend.dto.GuestCartItemDto;
import com.technest.backend.dto.GuestCheckoutRequest;
import com.technest.backend.entity.DeliveryAddressSnapshot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(IntegrationTestConfig.class)
public class OrderControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();
    }

    @Test
    public void testGuestCheckout() throws Exception {
        // Place Order as Guest
        GuestCheckoutRequest request = new GuestCheckoutRequest();
        request.setGuestEmail("guest_" + System.currentTimeMillis() + "@example.com");

        GuestCartItemDto item = new GuestCartItemDto();
        item.setProductId(1L); // Assuming product with ID 1 exists via V3 seed
        item.setQuantity(1);
        request.setItems(List.of(item));

        DeliveryAddressSnapshot address = new DeliveryAddressSnapshot();
        address.setFullName("Guest User");
        address.setAddressLine1("123 Guest St");
        address.setCity("Guest City");
        address.setPostalCode("12345");
        address.setCountry("Test Country");
        address.setPhoneNumber("1234567890");
        request.setDeliveryAddress(address);

        mockMvc.perform(post("/api/v1/orders/guest-checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.totalAmount").exists());
    }
}
