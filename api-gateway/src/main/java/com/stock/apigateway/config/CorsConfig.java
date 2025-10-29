package com.stock.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Allow origins
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",  // React
                "http://localhost:4200",  // Angular
                "http://localhost:8080",  // Gateway itself
                "http://localhost:5173"   // Vite
        ));

        // Allow methods
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow headers
        corsConfig.setAllowedHeaders(List.of("*"));

        // Allow credentials
        corsConfig.setAllowCredentials(true);

        // Max age
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
