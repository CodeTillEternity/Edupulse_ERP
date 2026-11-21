# Server-Side Payment Reconciliation and Webhook Architecture

## 1. Executive Summary

Online fee collection in educational institutions is fraught with dropped transactions, payment gateway timeouts, browser window premature closures, and payment fraud. Relying solely on client-side redirect callbacks (`window.location.href`) allows fraudulent manipulation of client parameters.

The **EduPulse Payment Reconciliation Engine** (`RazorpayWebhookController.java`) implements an authoritative server-to-server webhook consumer with **HMAC-SHA256 cryptographic verification**, transactional invoice reconciliation, and automatic real-time WhatsApp receipt generation.

---

## 2. Server-to-Server Webhook Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student / Guardian
    participant UI as EduPulse Student Portal
    participant RZP_JS as Razorpay Checkout Modal
    participant RZP_SRV as Razorpay Payment Gateway
    participant Webhook as EduPulse Webhook Controller (/api/webhooks/razorpay)
    participant DB as Institutional Database
    participant Comm as Communication Rails (WhatsApp)

    Student->>UI: Selects Outstanding Fee Invoice
    UI->>RZP_JS: Initialize Razorpay Checkout Order
    Student->>RZP_JS: Completes UPI / NetBanking / Card Payment
    RZP_JS->>RZP_SRV: Process & Authorize Transaction
    RZP_SRV-->>RZP_JS: Capture Confirmation
    Note over RZP_SRV,Webhook: Server-to-Server Asynchronous Event
    RZP_SRV->>Webhook: POST /api/webhooks/razorpay (Payload + X-Razorpay-Signature)
    Webhook->>Webhook: Compute HMAC-SHA256(Payload, Webhook_Secret)
    alt Signature Mismatch
        Webhook-->>RZP_SRV: 400 Bad Request (Fraud / Spoof Attempt Flagged)
    else Signature Validated
        Webhook->>DB: Query StudentInvoice by Invoice Number
        Webhook->>DB: Insert FeePayment Ledger Record (Method: ONLINE, TxID)
        Webhook->>DB: Update Invoice Status -> PAID, Balance -> 0.00
        Webhook->>DB: Record system_audit_logs Entry
        Webhook->>Comm: Trigger WhatsApp Receipt Dispatch
        Comm-->>Student: Deliver Official Fee Receipt with Download Link
        Webhook-->>RZP_SRV: 200 OK
    end
    UI->>Student: Shows Real-Time Green Payment Badge
```

---

## 3. Cryptographic Verification Specification

Every webhook payload received from Razorpay is validated against the institutional webhook secret using HMAC-SHA256:

$$\text{Expected Signature} = \text{HexEncode}\left( \text{HMAC-SHA256}(\text{Raw Payload Body}, \text{Secret}) \right)$$

### Verification Implementation (`RazorpayWebhookController.java`)
```java
Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
SecretKeySpec secret_key = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
sha256_HMAC.init(secret_key);
byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
String calculatedSignature = Hex.encodeHexString(hash);

if (!calculatedSignature.equals(signatureHeader)) {
    auditService.logSecurityEvent("PAYMENT_SPOOF_ATTEMPT", "Signature verification failed", ipAddress);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
}
```

---

## 4. Idempotency and State Synchronization

1. **Idempotent Handling:** If Razorpay retries webhook delivery due to temporary network jitter, the engine checks whether the transaction ID (`payment_id`) is already recorded in the `FeePayment` table:
   - If present: Immediately returns `200 OK` without re-crediting the student or creating duplicate ledger entries.
   - If absent: Executes atomic settlement within a `@Transactional` block.
2. **Partial vs Full Payments:** Supports both full fee settlement and configurable installment allocations.
3. **Immediate Receipt Generation:** Generates the digital receipt number following the format `RCP-YYYYMMDD-XXXX` and notifies the payer via WhatsApp within 1,500ms of gateway capture.
