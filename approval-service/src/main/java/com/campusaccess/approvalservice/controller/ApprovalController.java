package com.campusaccess.approvalservice.controller;
import com.campusaccess.approvalservice.entity.Approval;
import com.campusaccess.approvalservice.entity.OutingRequest;
import com.campusaccess.approvalservice.entity.User;
import com.campusaccess.approvalservice.repository.ApprovalRepository;
import com.campusaccess.approvalservice.repository.OutingRequestRepository;
import com.campusaccess.approvalservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/approvals")
public class ApprovalController {
    @Autowired private ApprovalRepository approvalRepository;
    @Autowired private OutingRequestRepository requestRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/pending")
    public List<OutingRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByIdDesc("PENDING");
    }

    @GetMapping("/pending-returns")
    public List<OutingRequest> getPendingReturns() {
        return requestRepository.findByStatusAndReturnStatusOrderByReturnRequestedAtAsc("APPROVED", "PENDING");
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
            User user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null) {
                user.setCampusStatus("OUT");
                userRepository.save(user);
            }
        }

        return ResponseEntity.ok(req);
    }

    @PostMapping("/return")
    public ResponseEntity<?> approveOrRejectReturn(@RequestHeader(value = "role", required = false) String callerRole,
                                                     @RequestBody Map<String, Object> body) {
        if (!"ADMIN".equals(callerRole)) {
            return ResponseEntity.status(403).body("Only admins can approve return requests.");
        }
        Object requestIdRaw = body.get("requestId");
        Long requestId = requestIdRaw == null ? null : Long.valueOf(requestIdRaw.toString());
        OutingRequest req = requestId == null ? null : requestRepository.findById(requestId).orElse(null);
        if (req == null) return ResponseEntity.badRequest().body("Request not found");
        if (!"PENDING".equals(req.getReturnStatus())) {
            return ResponseEntity.badRequest().body("No pending return request for this outing.");
        }

        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        req.setReturnStatus(approve ? "APPROVED" : "REJECTED");
        if (approve) {
            req.setActualReturnTime(LocalDateTime.now());
            User user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null) {
                user.setCampusStatus("IN");
                userRepository.save(user);
            }
        }
        return ResponseEntity.ok(requestRepository.save(req));
    }
}
