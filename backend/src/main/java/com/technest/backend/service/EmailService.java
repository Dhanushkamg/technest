package com.technest.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendVerificationEmail(String toEmail, String token) {
        String url = "http://localhost:5173/verify-email?token=" + token;
        logger.info("\n----------------------------------------------------------\n" +
                    "MOCK EMAIL: VERIFICATION\n" +
                    "To: {}\n" +
                    "Subject: Verify your TechNest account\n" +
                    "Body: Please click the link to verify your email: {}\n" +
                    "----------------------------------------------------------", toEmail, url);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String url = "http://localhost:5173/reset-password?token=" + token;
        logger.info("\n----------------------------------------------------------\n" +
                    "MOCK EMAIL: PASSWORD RESET\n" +
                    "To: {}\n" +
                    "Subject: Reset your TechNest password\n" +
                    "Body: Please click the link to reset your password: {}\n" +
                    "----------------------------------------------------------", toEmail, url);
    }

    public void sendOrderConfirmationEmail(String toEmail, Long orderId, String trackingNumber, byte[] invoicePdf) {
        String attachmentInfo = (invoicePdf != null && invoicePdf.length > 0) ? "      Attachment: invoice-" + orderId + ".pdf (" + invoicePdf.length + " bytes)\n" : "";
        logger.info("\n----------------------------------------------------------\n" +
                    "MOCK EMAIL: ORDER CONFIRMATION\n" +
                    "To: {}\n" +
                    "Subject: TechNest Order Confirmation - Order #{}\n" +
                    "Body: Your order #{} has been successfully placed.\n" +
                    "      Tracking Number: {}\n" +
                    "      You can track your order status in your dashboard.\n" +
                    attachmentInfo +
                    "----------------------------------------------------------", toEmail, orderId, orderId, trackingNumber);
    }

    public void sendOrderStatusUpdateEmail(String toEmail, Long orderId, String newStatus) {
        logger.info("\n----------------------------------------------------------\n" +
                    "MOCK EMAIL: ORDER STATUS UPDATE\n" +
                    "To: {}\n" +
                    "Subject: TechNest Order #{} Update\n" +
                    "Body: Your order #{} status has been updated to: {}\n" +
                    "----------------------------------------------------------", toEmail, orderId, orderId, newStatus);
    }
}
