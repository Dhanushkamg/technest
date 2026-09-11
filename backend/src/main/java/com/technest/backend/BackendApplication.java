package com.technest.backend;

import com.technest.backend.entity.User;
import com.technest.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			User admin = userRepository.findByEmail("admin@technest.com").orElse(new User());
			admin.setName("Admin User");
			admin.setEmail("admin@technest.com");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setRole("ADMIN");
			admin.setVerified(true);
			userRepository.save(admin);

			User customer = userRepository.findByEmail("customer@technest.com").orElse(new User());
			customer.setName("Test Customer");
			customer.setEmail("customer@technest.com");
			customer.setPassword(passwordEncoder.encode("customer123"));
			customer.setRole("USER");
			customer.setVerified(true);
			userRepository.save(customer);
		};
	}
}
