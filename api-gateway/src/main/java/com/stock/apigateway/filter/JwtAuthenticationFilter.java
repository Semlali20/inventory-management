package com.stock.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // Public endpoints that don't require JWT
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify-email",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/refresh",
            "/login",
            "/register",
            "/verify-email",
            "/forgot-password",
            "/reset-password",
            "/refresh",
            "/actuator",
            "/health",
            "/swagger-ui",
            "/v3/api-docs",
            "/webjars",
            "/.well-known"
    );

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().value(); // Use .value() instead of .toString()

            log.debug("Processing request for path: {}", path);

            // Check if public endpoint - SIMPLE AND DIRECT
            if (isPublicEndpoint(path)) {
                log.debug("Public endpoint detected, skipping JWT validation: {}", path);
                return chain.filter(exchange);
            }

            // Get Authorization header
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header for path: {}", path);
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract token
            String token = authHeader.substring(7);

            try {
                // Validate JWT and extract claims
                Claims claims = validateToken(token);

                log.debug("JWT validated successfully for user: {}", claims.getSubject());

                // Extract user information from claims
                String userId = claims.getSubject();
                String email = claims.get("email", String.class);
                String roles = claims.get("roles", String.class);
                String username = claims.get("username", String.class);

                // Add user info to request headers for downstream services
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId != null ? userId : "")
                        .header("X-User-Email", email != null ? email : "")
                        .header("X-User-Roles", roles != null ? roles : "")
                        .header("X-User-Username", username != null ? username : "")
                        .header("X-Authenticated", "true")
                        .build();

                log.debug("Request headers enriched with user info for userId: {}", userId);

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (ExpiredJwtException e) {
                log.error("JWT token expired: {}", e.getMessage());
                return onError(exchange, "Token expired", HttpStatus.UNAUTHORIZED);

            } catch (UnsupportedJwtException e) {
                log.error("Unsupported JWT token: {}", e.getMessage());
                return onError(exchange, "Unsupported token format", HttpStatus.UNAUTHORIZED);

            } catch (MalformedJwtException e) {
                log.error("Malformed JWT token: {}", e.getMessage());
                return onError(exchange, "Malformed token", HttpStatus.UNAUTHORIZED);

            } catch (SignatureException e) {
                log.error("Invalid JWT signature: {}", e.getMessage());
                return onError(exchange, "Invalid token signature", HttpStatus.UNAUTHORIZED);

            } catch (IllegalArgumentException e) {
                log.error("JWT claims string is empty: {}", e.getMessage());
                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);

            } catch (Exception e) {
                log.error("JWT validation failed with unexpected error: {}", e.getMessage(), e);
                return onError(exchange, "Token validation failed", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    /**
     * Validate JWT token and extract claims
     */
    private Claims validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if the endpoint is public (doesn't require authentication)
     * SIMPLIFIED - just check if path starts with any public endpoint
     */
    private boolean isPublicEndpoint(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }

        // Simple check: does the path start with or equal any public endpoint?
        for (String publicPath : PUBLIC_ENDPOINTS) {
            if (path.equals(publicPath) || path.startsWith(publicPath + "/") || path.startsWith(publicPath)) {
                log.debug("Path [{}] matched public endpoint [{}]", path, publicPath);
                return true;
            }
        }

        log.debug("Path [{}] is NOT a public endpoint", path);
        return false;
    }

    /**
     * Handle authentication errors
     */
    private Mono<Void> onError(ServerWebExchange exchange, String errorMessage, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String errorResponse = String.format(
                "{\"error\": \"%s\", \"message\": \"%s\", \"status\": %d}",
                httpStatus.getReasonPhrase(),
                errorMessage,
                httpStatus.value()
        );

        byte[] bytes = errorResponse.getBytes(StandardCharsets.UTF_8);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    /**
     * Configuration class for the filter
     */
    public static class Config {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}
