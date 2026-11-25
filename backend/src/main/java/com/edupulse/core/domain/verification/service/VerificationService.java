package com.edupulse.core.domain.verification.service;

import com.edupulse.core.domain.verification.dto.VerifiedCredentialDTO;

public interface VerificationService {
    VerifiedCredentialDTO verifyCredential(String identifier);
}
