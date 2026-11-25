package com.edupulse.core.domain.audit.repository;

import com.edupulse.core.domain.audit.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    Page<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType, Pageable pageable);
    Page<AuditLog> findByActorUsernameOrderByTimestampDesc(String actorUsername, Pageable pageable);
}
