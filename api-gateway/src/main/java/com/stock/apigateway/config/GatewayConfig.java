package com.stock.apigateway.config;

import com.stock.apigateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // Inject service URLs from application.yml
    @Value("${services.auth-service.url}")
    private String authServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    @Value("${services.inventory-service.url}")
    private String inventoryServiceUrl;

    @Value("${services.movement-service.url}")
    private String movementServiceUrl;

    @Value("${services.location-service.url}")
    private String locationServiceUrl;

    @Value("${services.quality-service.url}")
    private String qualityServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service - NO JWT FILTER
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri(authServiceUrl))

                // Product Service
                .route("product-service", r -> r
                        .path("/api/products/**", "/api/categories/**", "/api/items/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(productServiceUrl))

                // Inventory Service
                .route("inventory-service", r -> r
                        .path("/api/inventory/**", "/api/lots/**","/api/serials/**", "/api/v1/admin/cache/items/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(inventoryServiceUrl))

                // Movement Service
                .route("movement-service", r -> r
                        .path("/api/movement-tasks/**", "/api/movement-lines/**","/api/movements/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(movementServiceUrl))

                // Location Service
                .route("location-service", r -> r
                        .path("/api/locations/**", "/api/sites/**", "/api/warehouses/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(locationServiceUrl))

                // Quality Service
                .route("quality-service", r -> r
                        .path("/api/quality/**", "/api/quarantine/**", "/api/inspections/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri(qualityServiceUrl))

                .build();
    }
}