package com.stock.alertservice.controller;

import com.stock.alertservice.dto.request.AlertAcknowledgeRequest;
import com.stock.alertservice.dto.request.AlertFilterRequest;
import com.stock.alertservice.dto.request.AlertResolveRequest;
import com.stock.alertservice.dto.response.AlertResponse;
import com.stock.alertservice.dto.response.AlertStatisticsResponse;
import com.stock.alertservice.dto.response.ApiResponse;
import com.stock.alertservice.dto.response.PageResponse;
import com.stock.alertservice.enums.AlertLevel;
import com.stock.alertservice.enums.AlertStatus;
import com.stock.alertservice.enums.AlertType;
import com.stock.alertservice.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller pour la gestion des alertes
 */
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Alerts", description = "API pour la gestion des alertes")
public class AlertController {

    private final AlertService alertService;

    // ==================== READ ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer une alerte par ID", description = "Récupère les détails d'une alerte par son ID")
    public ResponseEntity<ApiResponse<AlertResponse>> getAlertById(
            @Parameter(description = "ID de l'alerte") @PathVariable String id) {

        log.info("REST request to get alert by ID: {}", id);

        AlertResponse response = alertService.getAlertById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer toutes les alertes", description = "Récupère toutes les alertes avec pagination")
    public ResponseEntity<PageResponse<AlertResponse>> getAllAlerts(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Tri par") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri") @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.info("REST request to get all alerts - page: {}, size: {}", page, size);

        PageResponse<AlertResponse> response = alertService.getAllAlerts(page, size, sortBy, sortDirection);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les alertes actives", description = "Récupère toutes les alertes actives")
    public ResponseEntity<PageResponse<AlertResponse>> getActiveAlerts(
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get active alerts - page: {}, size: {}", page, size);

        PageResponse<AlertResponse> response = alertService.getActiveAlerts(page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les alertes par statut", description = "Récupère les alertes par statut")
    public ResponseEntity<PageResponse<AlertResponse>> getAlertsByStatus(
            @Parameter(description = "Statut de l'alerte") @PathVariable AlertStatus status,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get alerts by status: {} - page: {}, size: {}", status, page, size);

        PageResponse<AlertResponse> response = alertService.getAlertsByStatus(status, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les alertes par type", description = "Récupère les alertes par type")
    public ResponseEntity<PageResponse<AlertResponse>> getAlertsByType(
            @Parameter(description = "Type d'alerte") @PathVariable AlertType type,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get alerts by type: {} - page: {}, size: {}", type, page, size);

        PageResponse<AlertResponse> response = alertService.getAlertsByType(type, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/level/{level}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les alertes par niveau", description = "Récupère les alertes par niveau de gravité")
    public ResponseEntity<PageResponse<AlertResponse>> getAlertsByLevel(
            @Parameter(description = "Niveau de l'alerte") @PathVariable AlertLevel level,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get alerts by level: {} - page: {}, size: {}", level, page, size);

        PageResponse<AlertResponse> response = alertService.getAlertsByLevel(level, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Récupérer les alertes par entité", description = "Récupère les alertes pour une entité spécifique")
    public ResponseEntity<PageResponse<AlertResponse>> getAlertsByEntity(
            @Parameter(description = "Type d'entité") @PathVariable String entityType,
            @Parameter(description = "ID de l'entité") @PathVariable String entityId,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get alerts by entity: {}/{} - page: {}, size: {}",
                entityType, entityId, page, size);

        PageResponse<AlertResponse> response = alertService.getAlertsByEntity(entityType, entityId, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== UPDATE ====================

    @PatchMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Prendre en compte une alerte", description = "Marque une alerte comme prise en compte")
    public ResponseEntity<ApiResponse<AlertResponse>> acknowledgeAlert(
            @Parameter(description = "ID de l'alerte") @PathVariable String id,
            @Valid @RequestBody AlertAcknowledgeRequest request) {

        log.info("REST request to acknowledge alert: {}", id);

        AlertResponse response = alertService.acknowledgeAlert(id, request);

        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged successfully", response));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Résoudre une alerte", description = "Marque une alerte comme résolue")
    public ResponseEntity<ApiResponse<AlertResponse>> resolveAlert(
            @Parameter(description = "ID de l'alerte") @PathVariable String id,
            @Valid @RequestBody AlertResolveRequest request) {

        log.info("REST request to resolve alert: {}", id);

        AlertResponse response = alertService.resolveAlert(id, request);

        return ResponseEntity.ok(ApiResponse.success("Alert resolved successfully", response));
    }

    @PatchMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    @Operation(summary = "Escalader une alerte", description = "Escalade une alerte au niveau supérieur")
    public ResponseEntity<ApiResponse<AlertResponse>> escalateAlert(
            @Parameter(description = "ID de l'alerte") @PathVariable String id) {

        log.info("REST request to escalate alert: {}", id);

        AlertResponse response = alertService.escalateAlert(id);

        return ResponseEntity.ok(ApiResponse.success("Alert escalated successfully", response));
    }

    // ==================== DELETE ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une alerte", description = "Supprime une alerte définitivement")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @Parameter(description = "ID de l'alerte") @PathVariable String id) {

        log.info("REST request to delete alert: {}", id);

        alertService.deleteAlert(id);

        return ResponseEntity.ok(ApiResponse.success("Alert deleted successfully", null));
    }

    // ==================== SEARCH ====================

    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Rechercher des alertes", description = "Recherche des alertes avec des filtres avancés")
    public ResponseEntity<PageResponse<AlertResponse>> searchAlerts(
            @Valid @RequestBody AlertFilterRequest filter,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to search alerts");

        PageResponse<AlertResponse> response = alertService.searchAlerts(filter, page, size);

        return ResponseEntity.ok(response);
    }

    // ==================== STATISTICS ====================

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'VIEWER')")
    @Operation(summary = "Obtenir les statistiques des alertes", description = "Récupère les statistiques globales des alertes")
    public ResponseEntity<ApiResponse<AlertStatisticsResponse>> getAlertStatistics() {
        log.info("REST request to get alert statistics");

        AlertStatisticsResponse response = alertService.getAlertStatistics();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
