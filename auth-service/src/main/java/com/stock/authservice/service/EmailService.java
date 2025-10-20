package com.stock.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:8081}")
    private String baseUrl;

    public void sendVerificationEmail(String email, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Verify Your Email - Stock Management System");

            String verificationUrl = baseUrl + "/api/auth/verify-email?token=" + token;

            String emailBody = String.format(
                    "Welcome to Stock Management System!\n\n" +
                            "Please click the link below to verify your email address:\n\n" +
                            "%s\n\n" +
                            "This link will expire in 24 hours.\n\n" +
                            "If you didn't create an account, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Stock Management Team",
                    verificationUrl
            );

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Verification email sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", email, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendPasswordResetEmail(String email, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request - Stock Management System");

            String resetUrl = baseUrl + "/api/auth/reset-password?token=" + token;

            String emailBody = String.format(
                    "Hello,\n\n" +
                            "We received a request to reset your password.\n\n" +
                            "Please click the link below to reset your password:\n\n" +
                            "%s\n\n" +
                            "This link will expire in 1 hour.\n\n" +
                            "If you didn't request a password reset, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Stock Management Team",
                    resetUrl
            );

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Password reset email sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    public void sendWelcomeEmail(String email, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Welcome to Stock Management System!");

            String emailBody = String.format(
                    "Hello %s,\n\n" +
                            "Welcome to Stock Management System!\n\n" +
                            "Your account has been successfully verified.\n\n" +
                            "You can now log in and start managing your inventory.\n\n" +
                            "If you have any questions, feel free to reach out to our support team.\n\n" +
                            "Best regards,\n" +
                            "Stock Management Team",
                    username
            );

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Welcome email sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", email, e);
            // Don't throw exception for welcome emails - it's not critical
        }
    }
}
