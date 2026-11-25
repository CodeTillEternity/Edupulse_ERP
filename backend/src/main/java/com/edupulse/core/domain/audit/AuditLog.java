package com.edupulse.core.domain.audit;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "SystemAuditLog")
@Table(name = "system_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class AuditLog extends BaseTenantEntity {

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // CREATE, UPDATE, DELETE, GRADE_CHANGE, FEE_DISCOUNT, PAYMENT_RECONCILE, LOGIN

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // STUDENT, GRADE, INVOICE, PAYMENT, ATTENDANCE, USER

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "actor_username", nullable = false, length = 100)
    private String actorUsername;

    @Column(name = "actor_role", length = 50)
    private String actorRole;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "timestamp", nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
