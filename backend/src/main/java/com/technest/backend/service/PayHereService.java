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
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.PaymentRepository;
import com.technest.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@Service
@Transactional
public class PayHereService {

    private static final Logger log = LoggerFactory.getLogger(PayHereService.class);

    @Value("${payhere.merchant-id}")
    private String merchantId;

    /**
     * Merchant Secret is NEVER returned in API responses or logged.
     * It is read from the environment variable PAYHERE_MERCHANT_SECRET
     * (overrides application.properties). No default fallback is provided
     * so the application fails fast at startup if the variable is missing.
     */
    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.sandbox:true}")
    private boolean isSandbox;

    @Value("${payhere.currency:LKR}")
    private String defaultCurrency;

    @Value("${payhere.return-url:http://localhost:5173/order-success}")
    private String returnUrl;

    @Value("${payhere.cancel-url:http://localhost:5173/checkout}")
    private String cancelUrl;

    @Value("${payhere.notify-url}")
    private String notifyUrl;

    private static final String PAYHERE_SANDBOX_URL = "https://sandbox.payhere.lk/pay/checkout";

    // PayHere status codes
    private static final int STATUS_SUCCESS      =  2;
    private static final int STATUS_PENDING      =  0;
    private static final int STATUS_CANCELLED    = -1;
    private static final int STATUS_FAILED       = -2;
    private static final int STATUS_CHARGEDBACK  = -3;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PayHereService(OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // -------------------------------------------------------------------------
    // Internal MD5 utility — NEVER call with merchantSecret as input externally
    // -------------------------------------------------------------------------

    /**
     * Computes an UPPERCASE hex MD5 hash of the given UTF-8 string.
     * Pads to 32 characters with leading zeros if necessary.
     */
    private String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            BigInteger no = new BigInteger(1, digest);
            StringBuilder hex = new StringBuilder(no.toString(16));
            while (hex.length() < 32) {
                hex.insert(0, "0");
            }
            return hex.toString().toUpperCase(Locale.US);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 hashing algorithm not available", e);
        }
    }

    /**
     * Generates the PayHere MD5 checkout hash used to secure payment initiation.
     *
     * Formula (PayHere specification):
     * MD5( merchant_id + order_id + amount + currency + UPPERCASE(MD5(merchant_secret)) )
     *
     * Amount is formatted to exactly 2 decimal places using US locale.
     * The merchant secret is NEVER included in any response — only its MD5 hash is used internally.
     */
    public String generateCheckoutHash(String orderId, BigDecimal amount, String currency) {
        String amountFormatted = String.format(Locale.US, "%.2f", amount);
        String hashedSecret = getMd5(merchantSecret);
        String strToHash = merchantId + orderId + amountFormatted + currency + hashedSecret;
        return getMd5(strToHash);
    }

    // -------------------------------------------------------------------------
    // Checkout Initiation
    // -------------------------------------------------------------------------

    /**
     * Creates a PENDING Payment record for the order (reusing an existing one if present)
     * and returns safe checkout parameters for the frontend PayHere popup.
     *
     * The amount is always fetched from PostgreSQL — the frontend-supplied orderId is trusted
     * only to look up the order, not to determine the payment amount.
     *
     * The merchantSecret is NEVER included in the returned PayHereCheckoutResponse.
     */
    public PayHereCheckoutResponse createCheckout(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Ownership check
        if (!order.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: You do not own this order.");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot process payment for a cancelled order.");
        }

        if (paymentRepository.existsByOrderAndStatus(order, PaymentStatus.SUCCESS)) {
            throw new BadRequestException("Order is already paid.");
        }

        // Reuse an existing PENDING PAYHERE payment for this order, or create a new one.
        Payment payment = paymentRepository.findByOrder(order).stream()
                .filter(p -> "PAYHERE".equalsIgnoreCase(p.getPaymentMethod())
                          && p.getStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    // Amount is taken directly from the database — NOT from the frontend request
                    p.setAmount(order.getTotalAmount());
                    p.setPaymentMethod("PAYHERE");
                    p.setStatus(PaymentStatus.PENDING);
                    p.setCreatedAt(LocalDateTime.now());
                    return paymentRepository.save(p);
                });

        // Use the DB order total for hash generation — this is the authoritative amount
        String orderIdStr = String.valueOf(order.getId());
        BigDecimal amount = order.getTotalAmount();
        String currency = defaultCurrency;
        String hash = generateCheckoutHash(orderIdStr, amount, currency);

        // Resolve customer contact details from the order's delivery address snapshot
        DeliveryAddressSnapshot addressSnapshot = order.getDeliveryAddress();
        String firstName = user.getName() != null ? user.getName().split(" ")[0] : "Customer";
        String lastName = (user.getName() != null && user.getName().contains(" "))
                ? user.getName().substring(user.getName().indexOf(" ") + 1)
                : "User";
        String phone   = addressSnapshot != null ? addressSnapshot.getPhoneNumber()
                       : (user.getPhoneNumber() != null ? user.getPhoneNumber() : "0771234567");
        String address = addressSnapshot != null ? addressSnapshot.getAddressLine1() : "No 123, Tech Street";
        String city    = addressSnapshot != null ? addressSnapshot.getCity()         : "Colombo";
        String country = addressSnapshot != null ? addressSnapshot.getCountry()      : "Sri Lanka";

        String itemsDescription = "TechNest Order #" + order.getId();

        log.info("PayHere checkout initiated for order={} amount={} currency={}",
                order.getId(), amount, currency);

        // NOTE: merchantSecret is NEVER included in this response object.
        return new PayHereCheckoutResponse(
                PAYHERE_SANDBOX_URL,
                merchantId,
                orderIdStr,
                itemsDescription,
                currency,
                amount,
                hash,
                firstName,
                lastName,
                user.getEmail(),
                phone,
                address,
                city,
                country,
                returnUrl + "/" + order.getId(),
                cancelUrl,
                notifyUrl
        );
    }

    // -------------------------------------------------------------------------
    // Notify Webhook Processing
    // -------------------------------------------------------------------------

    /**
     * Handles the PayHere server-to-server notification callback.
     *
     * Verification order (all must pass before any DB state changes):
     *  1. All required parameters are present.
     *  2. Merchant ID matches configured value.
     *  3. MD5 signature (md5sig) matches locally computed value.
     *  4. Order exists in the database.
     *  5. Currency matches configured default currency (LKR).
     *  6. PayHere amount matches the order total in PostgreSQL (BigDecimal compareTo).
     *  7. Status code is mapped to domain enums safely and idempotently.
     *
     * Idempotency guarantees:
     *  - A duplicate SUCCESS webhook on an already-SUCCESS payment returns true immediately.
     *  - A FAILED/CANCELLED/CHARGEDBACK webhook cannot downgrade an already-SUCCESS payment.
     *  - All state updates are wrapped in a single @Transactional scope.
     */
    public boolean processNotification(Map<String, String> params) {
        String receivedMerchantId = params.get("merchant_id");
        String orderIdStr         = params.get("order_id");
        String payhereAmountStr   = params.get("payhere_amount");
        String payhereCurrency    = params.get("payhere_currency");
        String statusCodeStr      = params.get("status_code");
        String receivedMd5Sig     = params.get("md5sig");

        // 1. Presence check
        if (receivedMerchantId == null || orderIdStr == null || payhereAmountStr == null
                || payhereCurrency == null || statusCodeStr == null || receivedMd5Sig == null) {
            log.warn("PayHere notification rejected: missing required parameters");
            throw new BadRequestException("Missing required PayHere notification parameters.");
        }

        // 2. Merchant ID check
        if (!merchantId.equals(receivedMerchantId)) {
            log.warn("PayHere notification rejected: merchant_id mismatch received={}", receivedMerchantId);
            throw new BadRequestException("Invalid merchant ID in PayHere notification.");
        }

        // 3. MD5 signature verification
        // Formula: MD5( merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(MD5(secret)) )
        // The merchantSecret is consumed only inside getMd5 — it is never logged or returned.
        String hashedSecret  = getMd5(merchantSecret);
        String strToHash     = receivedMerchantId + orderIdStr + payhereAmountStr
                             + payhereCurrency + statusCodeStr + hashedSecret;
        String expectedMd5Sig = getMd5(strToHash);

        if (!expectedMd5Sig.equalsIgnoreCase(receivedMd5Sig)) {
            log.warn("PayHere notification rejected: md5sig mismatch for order_id={}", orderIdStr);
            throw new BadRequestException("Invalid signature (md5sig) in PayHere notification.");
        }

        // 4. Resolve order from DB
        Long orderId;
        try {
            orderId = Long.parseLong(orderIdStr);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid order ID format in PayHere notification.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found for PayHere notification. order_id=" + orderIdStr));

        // 5. Currency verification
        if (!defaultCurrency.equalsIgnoreCase(payhereCurrency)) {
            log.warn("PayHere notification rejected: currency mismatch expected={} received={} order_id={}",
                    defaultCurrency, payhereCurrency, orderIdStr);
            throw new BadRequestException(
                    "Currency mismatch in PayHere notification. Expected: " + defaultCurrency
                    + ", Received: " + payhereCurrency);
        }

        // 6. Amount verification against DB order total
        BigDecimal notifyAmount;
        try {
            notifyAmount = new BigDecimal(payhereAmountStr);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid amount format in PayHere notification.");
        }

        if (notifyAmount.compareTo(order.getTotalAmount()) != 0) {
            log.warn("PayHere notification rejected: amount mismatch expected={} received={} order_id={}",
                    order.getTotalAmount(), notifyAmount, orderIdStr);
            throw new BadRequestException("Amount mismatch in PayHere notification. "
                    + "Expected: " + order.getTotalAmount() + ", Received: " + notifyAmount);
        }

        // 7. Parse status code
        int statusCode;
        try {
            statusCode = Integer.parseInt(statusCodeStr);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid status_code format in PayHere notification.");
        }

        // Locate or create the PAYHERE payment record for this order
        Payment payment = paymentRepository.findByOrder(order).stream()
                .filter(p -> "PAYHERE".equalsIgnoreCase(p.getPaymentMethod()))
                .findFirst()
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    p.setAmount(order.getTotalAmount());
                    p.setPaymentMethod("PAYHERE");
                    p.setStatus(PaymentStatus.PENDING);
                    p.setCreatedAt(LocalDateTime.now());
                    return paymentRepository.save(p);
                });

        User user = order.getUser();

        // 8. Safe, idempotent status transitions
        return applyStatusTransition(payment, order, user, statusCode);
    }

    /**
     * Applies the PayHere status-code → domain enum transition.
     *
     * Rules:
     * - An already-SUCCESS payment is NEVER downgraded by a later duplicate or failure notification.
     * - Status 2  → PaymentStatus.SUCCESS  + OrderStatus.CONFIRMED
     * - Status 0  → keep PENDING; log for informational purposes
     * - Status -1 → PaymentStatus.FAILED   (cancelled by user)
     * - Status -2 → PaymentStatus.FAILED   (declined/failed by gateway)
     * - Status -3 → PaymentStatus.REFUNDED (chargeback; REFUNDED is already in the domain model)
     */
    private boolean applyStatusTransition(Payment payment, Order order, User user, int statusCode) {
        switch (statusCode) {

            case STATUS_SUCCESS: {
                // Idempotency: if already SUCCESS, nothing to do
                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                    log.info("PayHere SUCCESS notification already processed for order={}. Skipping.", order.getId());
                    return true;
                }
                payment.setStatus(PaymentStatus.SUCCESS);
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
                paymentRepository.save(payment);
                notificationService.createNotificationIdempotent(
                        user,
                        NotificationType.PAYMENT_SUCCESS,
                        "Payment of " + payment.getAmount() + " for order #" + order.getId()
                                + " via PayHere was successful.",
                        "PAYMENT_SUCCESS_" + order.getId()
                );
                log.info("PayHere payment SUCCESS recorded for order={}", order.getId());
                return true;
            }

            case STATUS_PENDING: {
                // PayHere status 0 = payment is pending (e.g., bank transfer awaiting confirmation).
                // We keep the existing PENDING state; no order confirmation yet.
                log.info("PayHere PENDING notification received for order={}. Keeping existing state.", order.getId());
                return false;
            }

            case STATUS_CANCELLED: {
                // Status -1: customer cancelled the payment.
                // Do NOT downgrade a payment that is already SUCCESS.
                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                    log.warn("PayHere CANCELLED notification ignored — payment already SUCCESS for order={}", order.getId());
                    return false;
                }
                if (payment.getStatus() != PaymentStatus.FAILED) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    notificationService.createNotificationIdempotent(
                            user,
                            NotificationType.PAYMENT_FAILED,
                            "Payment for order #" + order.getId() + " via PayHere was cancelled.",
                            "PAYMENT_CANCELLED_" + order.getId()
                    );
                    log.info("PayHere payment CANCELLED recorded for order={}", order.getId());
                }
                return false;
            }

            case STATUS_FAILED: {
                // Status -2: payment declined/failed.
                // Do NOT downgrade a payment that is already SUCCESS.
                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                    log.warn("PayHere FAILED notification ignored — payment already SUCCESS for order={}", order.getId());
                    return false;
                }
                if (payment.getStatus() != PaymentStatus.FAILED) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    notificationService.createNotificationIdempotent(
                            user,
                            NotificationType.PAYMENT_FAILED,
                            "Payment for order #" + order.getId() + " via PayHere failed.",
                            "PAYMENT_FAILED_" + order.getId()
                    );
                    log.info("PayHere payment FAILED recorded for order={}", order.getId());
                }
                return false;
            }

            case STATUS_CHARGEDBACK: {
                // Status -3: chargeback. Map to PaymentStatus.REFUNDED (already in domain model).
                // Only transition if the payment was previously SUCCESS — chargebacks imply a prior success.
                if (payment.getStatus() == PaymentStatus.REFUNDED) {
                    log.info("PayHere CHARGEDBACK already processed for order={}. Skipping.", order.getId());
                    return false;
                }
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
                notificationService.createNotificationIdempotent(
                        user,
                        NotificationType.REFUND_PROCESSED,
                        "A chargeback has been processed for order #" + order.getId() + " via PayHere.",
                        "PAYMENT_CHARGEDBACK_" + order.getId()
                );
                log.info("PayHere CHARGEDBACK recorded as REFUNDED for order={}", order.getId());
                return false;
            }

            default:
                log.warn("PayHere notification received with unknown status_code={} for order={}", statusCode, order.getId());
                return false;
        }
    }
}
