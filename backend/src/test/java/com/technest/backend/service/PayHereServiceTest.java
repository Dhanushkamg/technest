package com.technest.backend.service;

import com.technest.backend.dto.PayHereCheckoutResponse;
import com.technest.backend.entity.DeliveryAddressSnapshot;
import com.technest.backend.entity.NotificationType;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Payment;
import com.technest.backend.entity.PaymentStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.PaymentRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PayHereService covering all security-critical scenarios:
 * hash generation, webhook signature verification, amount/currency validation,
 * all PayHere status codes, idempotency, and secret hygiene.
 */
@ExtendWith(MockitoExtension.class)
class PayHereServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private PayHereService payHereService;

    // Sandbox test values — these are the publicly known PayHere sandbox credentials
    private static final String MERCHANT_ID     = "1236634";
    private static final String MERCHANT_SECRET = "4321123443211234";
    private static final String CURRENCY        = "LKR";
    private static final String NOTIFY_URL      = "https://example.ngrok.io/api/payments/payhere/notify";
    private static final String RETURN_URL      = "http://localhost:5173/order-success";
    private static final String CANCEL_URL      = "http://localhost:5173/checkout";

    private User testUser;
    private Order testOrder;
    private Payment pendingPayment;

    @BeforeEach
    void setUp() {
        // Inject @Value fields via ReflectionTestUtils (since we're using Mockito, not Spring context)
        ReflectionTestUtils.setField(payHereService, "merchantId",     MERCHANT_ID);
        ReflectionTestUtils.setField(payHereService, "merchantSecret", MERCHANT_SECRET);
        ReflectionTestUtils.setField(payHereService, "defaultCurrency", CURRENCY);
        ReflectionTestUtils.setField(payHereService, "notifyUrl",      NOTIFY_URL);
        ReflectionTestUtils.setField(payHereService, "returnUrl",      RETURN_URL);
        ReflectionTestUtils.setField(payHereService, "cancelUrl",      CANCEL_URL);
        ReflectionTestUtils.setField(payHereService, "isSandbox",      true);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("user@technest.lk");
        testUser.setName("John Doe");
        testUser.setRole("USER");

        testOrder = new Order();
        testOrder.setId(42L);
        testOrder.setUser(testUser);
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setTotalAmount(new BigDecimal("1500.00"));
        testOrder.setCreatedAt(LocalDateTime.now());

        DeliveryAddressSnapshot addr = new DeliveryAddressSnapshot();
        addr.setPhoneNumber("0771234567");
        addr.setAddressLine1("No 123, Tech Street");
        addr.setCity("Colombo");
        addr.setCountry("Sri Lanka");
        testOrder.setDeliveryAddress(addr);

        pendingPayment = new Payment();
        pendingPayment.setId(10L);
        pendingPayment.setOrder(testOrder);
        pendingPayment.setAmount(new BigDecimal("1500.00"));
        pendingPayment.setPaymentMethod("PAYHERE");
        pendingPayment.setStatus(PaymentStatus.PENDING);
        pendingPayment.setCreatedAt(LocalDateTime.now());
    }

    // =========================================================================
    // Helper: compute expected MD5 the same way PayHere specifies
    // =========================================================================

    private String md5Upper(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString().toUpperCase(Locale.US);
    }

    private String computeCheckoutHash(String merchantId, String orderId,
                                       BigDecimal amount, String currency,
                                       String secret) throws Exception {
        String amtFmt      = String.format(Locale.US, "%.2f", amount);
        String hashedSec   = md5Upper(secret);
        String str         = merchantId + orderId + amtFmt + currency + hashedSec;
        return md5Upper(str);
    }

    private String computeNotifySig(String merchantId, String orderId,
                                    String amount, String currency,
                                    String statusCode, String secret) throws Exception {
        String hashedSec = md5Upper(secret);
        String str       = merchantId + orderId + amount + currency + statusCode + hashedSec;
        return md5Upper(str);
    }

    // =========================================================================
    // 1. Correct checkout hash generation
    // =========================================================================

    @Test
    void generateCheckoutHash_MatchesPayHereFormula() throws Exception {
        BigDecimal amount   = new BigDecimal("1500.00");
        String orderId      = "42";
        String expected     = computeCheckoutHash(MERCHANT_ID, orderId, amount, CURRENCY, MERCHANT_SECRET);

        String actual = payHereService.generateCheckoutHash(orderId, amount, CURRENCY);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void generateCheckoutHash_IsUpperCase() {
        String hash = payHereService.generateCheckoutHash("1", new BigDecimal("100.00"), "LKR");
        assertThat(hash).isEqualTo(hash.toUpperCase(Locale.US));
    }

    @Test
    void generateCheckoutHash_Has32Characters() {
        String hash = payHereService.generateCheckoutHash("1", new BigDecimal("100.00"), "LKR");
        assertThat(hash).hasSize(32);
    }

    // =========================================================================
    // 2. Invalid/missing Merchant Secret — configuration-level failure
    //    We verify the service uses merchantSecret internally (never exposes it).
    // =========================================================================

    @Test
    void createCheckout_MerchantSecretNeverInResponse() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.existsByOrderAndStatus(testOrder, PaymentStatus.SUCCESS)).thenReturn(false);
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        PayHereCheckoutResponse resp = payHereService.createCheckout(testUser.getEmail(), testOrder.getId());

        // Serialize the response to a string and assert the secret is not present
        String respStr = resp.toString() + resp.getHash() + resp.getMerchantId()
                + resp.getOrderId() + resp.getCurrency();
        assertThat(respStr).doesNotContain(MERCHANT_SECRET);

        // All required safe fields must be present
        assertThat(resp.getMerchantId()).isEqualTo(MERCHANT_ID);
        assertThat(resp.getOrderId()).isEqualTo("42");
        assertThat(resp.getCurrency()).isEqualTo(CURRENCY);
        assertThat(resp.getAmount()).isEqualByComparingTo(testOrder.getTotalAmount());
        assertThat(resp.getHash()).isNotBlank().hasSize(32);
        assertThat(resp.getNotifyUrl()).isEqualTo(NOTIFY_URL);
    }

    // =========================================================================
    // 3. Valid webhook signature
    // =========================================================================

    @Test
    void processNotification_ValidSignature_StatusSuccess_ReturnsTrue() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isTrue();
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }

    // =========================================================================
    // 4. Invalid webhook signature
    // =========================================================================

    @Test
    void processNotification_InvalidSignature_ThrowsBadRequest() {
        Map<String, String> params = buildParams("2", "1500.00", CURRENCY, "INVALIDSIGNATURE12345678901234");

        assertThatThrownBy(() -> payHereService.processNotification(params))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("signature");
    }

    // =========================================================================
    // 5. Correct amount passes
    // =========================================================================

    @Test
    void processNotification_CorrectAmount_Passes() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Should not throw
        boolean result = payHereService.processNotification(params);
        assertThat(result).isTrue();
    }

    // =========================================================================
    // 6. Amount mismatch
    // =========================================================================

    @Test
    void processNotification_AmountMismatch_ThrowsBadRequest() throws Exception {
        // Signature is valid for the tampered amount
        String tamperedAmount = "1.00";
        String sig = computeNotifySig(MERCHANT_ID, "42", tamperedAmount, CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", tamperedAmount, CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));

        assertThatThrownBy(() -> payHereService.processNotification(params))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Amount mismatch");
    }

    // =========================================================================
    // 7. Correct currency passes
    // =========================================================================

    @Test
    void processNotification_CorrectCurrency_Passes() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", "LKR", "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", "LKR", sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = payHereService.processNotification(params);
        assertThat(result).isTrue();
    }

    // =========================================================================
    // 8. Currency mismatch
    // =========================================================================

    @Test
    void processNotification_CurrencyMismatch_ThrowsBadRequest() throws Exception {
        // Signature must match the wrong currency to get past sig check
        String wrongCurrency = "USD";
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", wrongCurrency, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", wrongCurrency, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));

        assertThatThrownBy(() -> payHereService.processNotification(params))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Currency mismatch");
    }

    // =========================================================================
    // 9. Status code 2 = SUCCESS
    // =========================================================================

    @Test
    void processNotification_StatusCode2_SetsSuccessAndConfirmsOrder() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isTrue();
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(notificationService).createNotification(eq(testUser), eq(NotificationType.PAYMENT_SUCCESS), any());
    }

    // =========================================================================
    // 10. Status code 0 = PENDING
    // =========================================================================

    @Test
    void processNotification_StatusCode0_KeepsPending() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "0", MERCHANT_SECRET);
        Map<String, String> params = buildParams("0", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isFalse();
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.PENDING);
        verify(paymentRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any());
    }

    // =========================================================================
    // 11. Status codes -1 and -2 = FAILED
    // =========================================================================

    @Test
    void processNotification_StatusCodeMinus1_SetsFailed() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "-1", MERCHANT_SECRET);
        Map<String, String> params = buildParams("-1", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isFalse();
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        verify(notificationService).createNotification(eq(testUser), eq(NotificationType.PAYMENT_FAILED), any());
    }

    @Test
    void processNotification_StatusCodeMinus2_SetsFailed() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "-2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("-2", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isFalse();
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    // =========================================================================
    // 12. Status code -3 = CHARGEDBACK → PaymentStatus.REFUNDED
    // =========================================================================

    @Test
    void processNotification_StatusCodeMinus3_SetsRefunded() throws Exception {
        // A chargeback arrives after a previously successful payment
        pendingPayment.setStatus(PaymentStatus.SUCCESS);

        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "-3", MERCHANT_SECRET);
        Map<String, String> params = buildParams("-3", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isFalse();
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        verify(notificationService).createNotification(eq(testUser), eq(NotificationType.REFUND_PROCESSED), any());
    }

    // =========================================================================
    // 13. Duplicate SUCCESS webhook — idempotent, no double-update
    // =========================================================================

    @Test
    void processNotification_DuplicateSuccess_IsIdempotent() throws Exception {
        pendingPayment.setStatus(PaymentStatus.SUCCESS); // Already succeeded
        testOrder.setStatus(OrderStatus.CONFIRMED);

        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isTrue();
        // No additional saves or notifications should happen
        verify(paymentRepository, never()).save(any());
        verify(orderRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any());
    }

    // =========================================================================
    // 14. Failed notification cannot downgrade already-SUCCESS payment
    // =========================================================================

    @Test
    void processNotification_FailedAfterSuccess_DoesNotDowngrade() throws Exception {
        pendingPayment.setStatus(PaymentStatus.SUCCESS);
        testOrder.setStatus(OrderStatus.CONFIRMED);

        String sig = computeNotifySig(MERCHANT_ID, "42", "1500.00", CURRENCY, "-1", MERCHANT_SECRET);
        Map<String, String> params = buildParams("-1", "1500.00", CURRENCY, sig);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of(pendingPayment));

        boolean result = payHereService.processNotification(params);

        assertThat(result).isFalse();
        // Payment must remain SUCCESS — not downgraded to FAILED
        assertThat(pendingPayment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(paymentRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any());
    }

    // =========================================================================
    // 15. Unknown order ID
    // =========================================================================

    @Test
    void processNotification_UnknownOrderId_ThrowsResourceNotFound() throws Exception {
        String sig = computeNotifySig(MERCHANT_ID, "9999", "1500.00", CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = new HashMap<>();
        params.put("merchant_id",     MERCHANT_ID);
        params.put("order_id",        "9999");
        params.put("payhere_amount",  "1500.00");
        params.put("payhere_currency", CURRENCY);
        params.put("status_code",     "2");
        params.put("md5sig",          sig);

        when(orderRepository.findById(9999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> payHereService.processNotification(params))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // =========================================================================
    // 16. Merchant Secret never returned in createCheckout API response
    //     (Already partially covered in test #2 — this specifically inspects
    //     each field of the DTO for the raw secret string.)
    // =========================================================================

    @Test
    void createCheckout_NoFieldContainsMerchantSecret() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.existsByOrderAndStatus(testOrder, PaymentStatus.SUCCESS)).thenReturn(false);
        when(paymentRepository.findByOrder(testOrder)).thenReturn(List.of());
        when(paymentRepository.save(any())).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        PayHereCheckoutResponse resp = payHereService.createCheckout(testUser.getEmail(), testOrder.getId());

        // Build a full string from every field in the response
        String allFields = String.join("|",
                resp.getSandboxUrl(),
                resp.getMerchantId(),
                resp.getOrderId(),
                resp.getItems(),
                resp.getCurrency(),
                resp.getAmount().toPlainString(),
                resp.getHash(),
                resp.getFirstName(),
                resp.getLastName(),
                resp.getEmail(),
                resp.getPhone(),
                resp.getAddress(),
                resp.getCity(),
                resp.getCountry(),
                resp.getReturnUrl(),
                resp.getCancelUrl(),
                resp.getNotifyUrl()
        );

        assertThat(allFields).doesNotContain(MERCHANT_SECRET);
    }

    // =========================================================================
    // Edge: missing required params
    // =========================================================================

    @Test
    void processNotification_MissingParams_ThrowsBadRequest() {
        Map<String, String> params = new HashMap<>();
        params.put("merchant_id", MERCHANT_ID);
        // order_id and others are missing

        assertThatThrownBy(() -> payHereService.processNotification(params))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Missing required");
    }

    @Test
    void processNotification_WrongMerchantId_ThrowsBadRequest() throws Exception {
        String sig = computeNotifySig("WRONG_ID", "42", "1500.00", CURRENCY, "2", MERCHANT_SECRET);
        Map<String, String> params = buildParams("2", "1500.00", CURRENCY, sig);
        params.put("merchant_id", "WRONG_ID");

        assertThatThrownBy(() -> payHereService.processNotification(params))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("merchant ID");
    }

    // =========================================================================
    // Helper
    // =========================================================================

    private Map<String, String> buildParams(String statusCode, String amount,
                                            String currency, String sig) {
        Map<String, String> params = new HashMap<>();
        params.put("merchant_id",      MERCHANT_ID);
        params.put("order_id",         "42");
        params.put("payhere_amount",   amount);
        params.put("payhere_currency", currency);
        params.put("status_code",      statusCode);
        params.put("md5sig",           sig);
        return params;
    }
}
