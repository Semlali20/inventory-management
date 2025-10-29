package com.stock.apigateway.config;

import com.stock.apigateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                        .rewritePath("/api/auth/(?<segment>.*)", "/${segment}")
                                // ✅ NO JWT FILTER - Auth handles its own security
                        )
                        .uri("http://localhost:8083"))

                // Product Service
                .route("product-service", r -> r
                        .path("/api/products/**", "/api/categories/**", "/api/items/**")
                        .filters(f -> f
                                .rewritePath("/api/(?<segment>.*)", "/${segment}")
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8082"))

                // Inventory Service
                .route("inventory-service", r -> r
                        .path("/api/inventory/**", "/api/lots/**", "/api/serials/**")
                        .filters(f -> f
                                .rewritePath("/api/(?<segment>.*)", "/${segment}")
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8085"))

                // Movement Service
                .route("movement-service", r -> r
                        .path("/api/movements/**", "/api/tasks/**")
                        .filters(f -> f
                                .rewritePath("/api/(?<segment>.*)", "/${segment}")
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8086"))

                // Location Service
                .route("location-service", r -> r
                        .path("/api/locations/**", "/api/sites/**", "/api/warehouses/**")
                        .filters(f -> f
                                .rewritePath("/api/(?<segment>.*)", "/${segment}")
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8084"))

                // Quality Service
                .route("quality-service", r -> r
                        .path("/api/quality/**", "/api/quarantine/**", "/api/inspections/**")
                        .filters(f -> f
                                .rewritePath("/api/(?<segment>.*)", "/${segment}")
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8087"))

                .build();
    }
}
