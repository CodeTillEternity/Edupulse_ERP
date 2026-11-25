package com.edupulse.core.domain.audit.service;

import com.edupulse.core.domain.audit.AuditLog;
import com.edupulse.core.domain.audit.repository.AuditLogRepository;
import com.edupulse.core.domain.base.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(String actionType, String entityType, String entityId, String actorUsername,
                       String actorRole, String description, String oldValue, String newValue, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actionType(actionType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .actorUsername(actorUsername != null ? actorUsername : "system")
                    .actorRole(actorRole != null ? actorRole : "SYSTEM")
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .description(description)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLog.setTenantId(TenantContext.getTenantId());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to record audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs(int limit) {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
