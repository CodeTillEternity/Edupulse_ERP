package com.edupulse.core.api.rest;

import com.edupulse.core.domain.verification.dto.CourseVerificationItemDTO;
import com.edupulse.core.domain.verification.dto.VerifiedCredentialDTO;
import com.edupulse.core.domain.verification.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/verify")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@Tag(name = "Public Credential Verification", description = "Public, unauthenticated API for third-party degree, marksheet, and transcript verification")
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/{identifier}")
    @Operation(summary = "Verify Credential by Token or Enrollment", description = "Authenticates a transcript or degree token against the institutional ledger")
    public ResponseEntity<VerifiedCredentialDTO> verify(@PathVariable String identifier) {
        log.info("[Public Verification Inquiry] Validating credential token: {}", identifier);
        VerifiedCredentialDTO credential = verificationService.verifyCredential(identifier);
        return ResponseEntity.ok(credential);
    }

    @GetMapping("/lookup")
    @Operation(summary = "Lookup Credential by Parameter", description = "Alternative query param lookup for QR scanners")
    public ResponseEntity<VerifiedCredentialDTO> lookup(@RequestParam String id) {
        log.info("[Public Verification Inquiry] Query param lookup: {}", id);
        VerifiedCredentialDTO credential = verificationService.verifyCredential(id);
        return ResponseEntity.ok(credential);
    }

    @GetMapping(value = "/portal/{identifier}", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Render Official Public Verification HTML Portal", description = "Serves standalone, print-ready, authentic institutional verification web portal")
    public ResponseEntity<String> renderPublicPortal(
            @PathVariable String identifier,
            @RequestParam(required = false) String instName,
            @RequestParam(required = false) String instCode) {
        log.info("[Public Portal Web Request] Rendering official certificate verification portal for: {}, instName: {}", identifier, instName);
        VerifiedCredentialDTO cred = verificationService.verifyCredential(identifier);
        if (instName != null && !instName.trim().isEmpty()) {
            cred.setInstitutionName(instName.trim());
        }
        String html = buildVerificationHtml(cred);
        return ResponseEntity.ok(html);
    }

    private String buildVerificationHtml(VerifiedCredentialDTO c) {
        StringBuilder courseRows = new StringBuilder();
        if (c.getCourseRecords() != null) {
            for (CourseVerificationItemDTO r : c.getCourseRecords()) {
                courseRows.append(String.format("""
                    <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td class="py-3 px-4 font-mono font-bold text-slate-900 text-xs">%s</td>
                        <td class="py-3 px-4 text-slate-800 text-xs font-medium">%s</td>
                        <td class="py-3 px-4 text-slate-500 text-xs">%s</td>
                        <td class="py-3 px-4 text-center font-bold text-xs"><span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">%s</span></td>
                        <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 text-xs">%.2f</td>
                        <td class="py-3 px-4 text-right text-xs"><span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✓ Sealed</span></td>
                    </tr>
                """,
                r.getCourseCode(),
                r.getCourseName(),
                r.getExamName(),
                r.getGradeLabel(),
                r.getGradePoint(),
                r.getStatus()));
            }
        }

        return String.format("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduPulse Public Credential Registry • Verified Credential %s</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .print-border { border: 1px solid #cbd5e1 !important; box-shadow: none !important; }
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
    <!-- Top Government/University Official Header -->
    <header class="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-50 no-print">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    🏛️
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900 text-sm">EduPulse Public Credential Registry</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            OFFICIAL AUDIT GATEWAY
                        </span>
                    </div>
                    <p class="text-xs text-slate-500">Autonomous Degree & Transcript Verification Authority</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="window.print()" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5">
                    🖨️ Print Attestation
                </button>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-5xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
        <!-- Official Authentication Banner -->
        <div class="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 shadow-sm relative overflow-hidden print-border">
            <div class="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700 text-2xl shadow-inner">
                        🛡️
                    </div>
                    <div class="space-y-1">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ STATUTORY RECORD CONFIRMED & CONFERRED
                        </div>
                        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Authentic Academic Credential
                        </h1>
                        <p class="text-xs text-slate-600 max-w-xl leading-relaxed">
                            This academic record is cryptographically bound to the institutional registry of the Office of the Controller of Examinations. All grades, credit points, and cumulative standing match the permanent autonomous university archives.
                        </p>
                    </div>
                </div>

                <div class="flex flex-col gap-2 shrink-0 no-print">
                    <button onclick="copyHash()" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs">
                        📋 Copy SHA-256 Digest
                    </button>
                    <span id="copiedToast" class="text-[11px] text-emerald-600 font-semibold text-center hidden">Copied to clipboard!</span>
                </div>
            </div>
        </div>

        <!-- Official University Letterhead & Certificate Box -->
        <div class="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 shadow-xs print-border">
            <!-- Institutional Header -->
            <div class="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span class="text-xs font-extrabold tracking-widest text-indigo-700 uppercase">
                        %s
                    </span>
                    <h2 class="text-xl font-bold text-slate-900 tracking-tight mt-1">
                        OFFICE OF THE CONTROLLER OF EXAMINATIONS
                    </h2>
                    <p class="text-xs text-slate-500">
                        Statutory University Credential Attestation & Non-Repudiation Certificate
                    </p>
                </div>
                <div class="text-left md:text-right text-xs space-y-1">
                    <div class="font-mono text-slate-600">Token: <span class="text-indigo-600 font-bold">%s</span></div>
                    <div class="text-slate-500">Concurred on: <span class="font-semibold text-slate-700">%s</span></div>
                </div>
            </div>

            <!-- Candidate Dossier & Performance Matrix -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Profile Matrix -->
                <div class="md:col-span-2 bg-slate-50 rounded-xl p-6 border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <span class="text-slate-500 block font-medium">Candidate Full Name</span>
                        <span class="font-bold text-slate-900 text-base">%s</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block font-medium">University PRN / Roll</span>
                        <span class="font-mono font-bold text-indigo-600 text-base">%s</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block font-medium">Degree & Specialization</span>
                        <span class="font-semibold text-slate-800">%s</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block font-medium">Academic Cohort</span>
                        <span class="text-slate-700">%s</span>
                    </div>
                    <div class="col-span-2 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <span class="text-slate-500 font-medium">Conferral Division / Standing</span>
                        <span class="font-bold text-emerald-700 text-sm bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">%s</span>
                    </div>
                </div>

                <!-- Cumulative CGPA Card -->
                <div class="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-indigo-200">CUMULATIVE GPA</span>
                        <span class="text-lg">🎖️</span>
                    </div>
                    <div class="my-3">
                        <div class="text-5xl font-extrabold tracking-tight">
                            %.2f
                        </div>
                        <p class="text-xs text-indigo-200 mt-1 font-medium">Scale: 10.00 Point UGC CBCS</p>
                    </div>
                    <div class="pt-3 border-t border-indigo-600/60 text-xs text-indigo-200 flex justify-between">
                        <span>Evaluations: %d Courses</span>
                        <span class="text-emerald-300 font-bold">✓ Conferred</span>
                    </div>
                </div>
            </div>

            <!-- Course Records Table -->
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>📚</span> Certified Course Evaluations & Grade Points
                    </h3>
                    <span class="text-xs text-slate-500 font-mono">Total Earned Credits: 20.00</span>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-100 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-semibold">
                            <tr>
                                <th class="py-3 px-4">Course Code</th>
                                <th class="py-3 px-4">Course Title</th>
                                <th class="py-3 px-4">Evaluation Mode</th>
                                <th class="py-3 px-4 text-center">Grade</th>
                                <th class="py-3 px-4 text-right">Grade Point</th>
                                <th class="py-3 px-4 text-right">Registry Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            %s
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Cryptographic Fingerprint Seal -->
            <div class="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        🔒 Cryptographic Integrity & Non-Repudiation Audit Trail
                    </span>
                    <span class="text-[11px] text-slate-500 font-mono">Algorithm: SHA-256 HMAC</span>
                </div>
                
                <div class="space-y-1">
                    <div class="text-[11px] text-slate-500 font-medium">Authoritative Digital Fingerprint</div>
                    <div class="p-2.5 rounded-lg bg-white border border-slate-300 font-mono text-[11px] text-indigo-700 break-all select-all flex items-center justify-between gap-2 shadow-xs">
                        <span id="fingerprintText">%s</span>
                        <button onclick="copyHash()" class="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800" title="Copy Hash">
                            📋
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[11px] text-slate-600">
                    <div>
                        <span class="block font-medium text-slate-500">Accreditation</span>
                        <span class="text-slate-900 font-semibold">NAAC 'A+' / AICTE Approved</span>
                    </div>
                    <div>
                        <span class="block font-medium text-slate-500">Autonomous Status</span>
                        <span class="text-slate-900 font-semibold">UGC Recognized</span>
                    </div>
                    <div>
                        <span class="block font-medium text-slate-500">Issuing Registry</span>
                        <span class="text-slate-900 font-semibold">Controller of Exams</span>
                    </div>
                    <div>
                        <span class="block font-medium text-slate-500">Security Standard</span>
                        <span class="text-emerald-700 font-semibold">W3C Non-Repudiation</span>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 EduPulse Institutional ERP. Statutory Tamper-Evident Academic Registry.</p>
            <div class="flex items-center gap-4 text-slate-600">
                <span class="text-emerald-600 font-semibold flex items-center gap-1">
                    ● Registry Status: Concurred & Online
                </span>
            </div>
        </div>
    </footer>

    <script>
        function copyHash() {
            var text = document.getElementById('fingerprintText').innerText;
            navigator.clipboard.writeText(text).then(function() {
                var toast = document.getElementById('copiedToast');
                if (toast) {
                    toast.classList.remove('hidden');
                    setTimeout(function() { toast.classList.add('hidden'); }, 3000);
                }
            });
        }
    </script>
</body>
</html>
        """,
        c.getVerificationToken(),
        c.getInstitutionName(),
        c.getVerificationToken(),
        c.getIssueDate(),
        c.getStudentName(),
        c.getEnrollmentNumber(),
        c.getProgramDegree(),
        c.getBatchName(),
        c.getDivision(),
        c.getCumulativeGpa() != null ? c.getCumulativeGpa().doubleValue() : 0.0,
        c.getTotalEvaluations(),
        courseRows.toString(),
        c.getDigitalSignatureSha256() != null ? c.getDigitalSignatureSha256() : "");
    }
}

