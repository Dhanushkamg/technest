package com.technest.backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Not a real test — used purely to print a BCrypt hash of "password"
 * using the same BCryptPasswordEncoder (default strength 10) that
 * SecurityConfig registers as a bean.
 *
 * Run with:  .\mvnw.cmd -Dtest=BcryptHashPrinterTest test -pl .
 * Then look for "BCrypt hash:" in the console output.
 */
class BcryptHashPrinterTest {

    @Test
    void printBcryptHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); // strength 10, same as SecurityConfig
        String raw  = "password";
        String hash = encoder.encode(raw);

        System.out.println("==============================================");
        System.out.println("Plain text : " + raw);
        System.out.println("BCrypt hash: " + hash);
        System.out.println("Matches    : " + encoder.matches(raw, hash));
        System.out.println("==============================================");

        // Make the test always pass
        org.junit.jupiter.api.Assertions.assertTrue(encoder.matches(raw, hash));
    }
}
