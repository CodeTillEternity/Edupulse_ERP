package com.edupulse.core.domain.communication.repository;

import com.edupulse.core.domain.communication.CommunicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("coreCommunicationLogRepository")
public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, Long> {
    List<CommunicationLog> findByTenantIdOrderBySentAtDesc(String tenantId);
    List<CommunicationLog> findByTenantIdAndStudentEnrollmentOrderBySentAtDesc(String tenantId, String studentEnrollment);
}
