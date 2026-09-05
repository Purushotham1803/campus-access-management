package com.campusaccess.approvalservice.controller;
import com.campusaccess.approvalservice.entity.AccessPass;
import com.campusaccess.approvalservice.entity.Approval;
import com.campusaccess.approvalservice.entity.OutingRequest;
import com.campusaccess.approvalservice.repository.AccessPassRepository;
import com.campusaccess.approvalservice.repository.ApprovalRepository;
import com.campusaccess.approvalservice.repository.OutingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/approvals")
public class ApprovalController {
    @Autowired private ApprovalRepository approvalRepository;
    @Autowired private OutingRequestRepository requestRepository;
    @Autowired private AccessPassRepository passRepository;

    @GetMapping("/pending")
    public List<OutingRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByIdDesc("PENDING");
    }

    @GetMapping("/history")
    public List<Approval> getHistory() {
        return approvalRepository.findAllByOrderByIdDesc();
    }

    @PostMapping
    public ResponseEntity<?> approveOrReject(@RequestBody Approval approval) {
        OutingRequest req = requestRepository.findById(approval.getRequestId()).orElse(null);
        if (req == null) return ResponseEntity.badRequest().body("Request not found");
        if (!"PENDING".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending requests can be approved or rejected.");
        }

        req.setStatus(approval.getStatus().toUpperCase());
        requestRepository.save(req);
        approvalRepository.save(approval);

        if ("APPROVED".equalsIgnoreCase(approval.getStatus())) {
            AccessPass pass = new AccessPass();
            pass.setRequestId(req.getId());
            pass.setPassCode(UUID.randomUUID().toString());
            passRepository.save(pass);
            return ResponseEntity.ok(pass);
        }

        return ResponseEntity.ok(approval);
    }
}
