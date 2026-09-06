package com.campusaccess.accessservice.controller;
import com.campusaccess.accessservice.dto.PendingReturnDto;
import com.campusaccess.accessservice.dto.RequestDto;
import com.campusaccess.accessservice.entity.AccessPass;
import com.campusaccess.accessservice.entity.GateEntryExit;
import com.campusaccess.accessservice.entity.OutingRequest;
import com.campusaccess.accessservice.entity.User;
import com.campusaccess.accessservice.repository.AccessPassRepository;
import com.campusaccess.accessservice.repository.GateEntryExitRepository;
import com.campusaccess.accessservice.repository.OutingRequestRepository;
import com.campusaccess.accessservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/access")
public class AccessController {
    @Autowired private OutingRequestRepository requestRepository;
    @Autowired private AccessPassRepository passRepository;
    @Autowired private GateEntryExitRepository gateRepository;
    @Autowired private UserRepository userRepository;

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody RequestDto dto) {
        if (dto.getUserId() == null || dto.getType() == null || dto.getDepartureTime() == null || dto.getReturnTime() == null) {
            return ResponseEntity.badRequest().body("userId, type, departureTime and returnTime are required.");
        }
        if (!dto.getReturnTime().isAfter(dto.getDepartureTime())) {
            return ResponseEntity.badRequest().body("Return time must be after departure time.");
        }
        if ("LOCAL".equalsIgnoreCase(dto.getType())) {
            int depHour = dto.getDepartureTime().getHour();
            int retHour = dto.getReturnTime().getHour();
            boolean sameDay = dto.getDepartureTime().toLocalDate().isEqual(dto.getReturnTime().toLocalDate());
            if (depHour < 5 || retHour >= 21 || !sameDay) {
                return ResponseEntity.badRequest().body("LOCAL outing is only allowed between 5:00 AM and 9:00 PM on the same day.");
            }
        }

        OutingRequest req = new OutingRequest();
        req.setUserId(dto.getUserId());
        req.setType(dto.getType().toUpperCase());
        req.setReason(dto.getReason());
        req.setDestination(dto.getDestination());
        req.setDepartureTime(dto.getDepartureTime());
        req.setReturnTime(dto.getReturnTime());
        req.setStatus("PENDING");
        return ResponseEntity.ok(requestRepository.save(req));
    }

    @GetMapping("/requests")
    public List<OutingRequest> getAllRequests() {
        return requestRepository.findAllByOrderByIdDesc();
    }

    @GetMapping("/requests/user/{userId}")
    public List<OutingRequest> getUserRequests(@PathVariable Long userId) {
        return requestRepository.findByUserId(userId);
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<OutingRequest> getRequestById(@PathVariable Long id) {
        return requestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id) {
        OutingRequest req = requestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        if (!"PENDING".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending requests can be cancelled.");
        }
        req.setStatus("CANCELLED");
        return ResponseEntity.ok(requestRepository.save(req));
    }

    @GetMapping("/passes/request/{requestId}")
    public ResponseEntity<AccessPass> getPassByRequest(@PathVariable Long requestId) {
        return passRepository.findByRequestId(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // The pass for the outing a user is currently OUT on: their most recent
    // APPROVED request whose pass hasn't been marked returned yet.
    @GetMapping("/passes/active/{userId}")
    public ResponseEntity<?> getActivePass(@PathVariable Long userId) {
        List<OutingRequest> approved = requestRepository.findByUserId(userId).stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .sorted(Comparator.comparing(OutingRequest::getId).reversed())
                .toList();
        for (OutingRequest r : approved) {
            AccessPass pass = passRepository.findByRequestId(r.getId()).orElse(null);
            if (pass != null && pass.getActualReturnTime() == null) {
                return ResponseEntity.ok(pass);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/passes/{id}/request-return")
    public ResponseEntity<?> requestReturn(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        AccessPass pass = passRepository.findById(id).orElse(null);
        if (pass == null) return ResponseEntity.notFound().build();

        OutingRequest req = requestRepository.findById(pass.getRequestId()).orElse(null);
        if (req == null) return ResponseEntity.badRequest().body("Underlying request not found.");

        Object userIdRaw = body.get("userId");
        Long userId = userIdRaw == null ? null : Long.valueOf(userIdRaw.toString());
        if (userId == null || !userId.equals(req.getUserId())) {
            return ResponseEntity.status(403).body("This pass does not belong to you.");
        }

        String status = pass.getReturnStatus();
        if (status != null && (status.equals("PENDING") || status.equals("APPROVED"))) {
            return ResponseEntity.badRequest().body("A return request is already " + status.toLowerCase() + ".");
        }

        pass.setReturnStatus("PENDING");
        pass.setReturnRequestedAt(LocalDateTime.now());
        return ResponseEntity.ok(passRepository.save(pass));
    }

    @GetMapping("/passes/pending-returns")
    public List<PendingReturnDto> getPendingReturns() {
        return passRepository.findByReturnStatusOrderByReturnRequestedAtAsc("PENDING").stream()
                .map(pass -> {
                    OutingRequest req = requestRepository.findById(pass.getRequestId()).orElse(null);
                    User user = req != null ? userRepository.findById(req.getUserId()).orElse(null) : null;
                    return new PendingReturnDto(
                            pass.getId(),
                            req != null ? req.getId() : null,
                            user != null ? user.getUsername() : "unknown",
                            req != null ? req.getDestination() : null,
                            req != null ? req.getReturnTime() : null,
                            pass.getReturnRequestedAt()
                    );
                })
                .toList();
    }

    @PostMapping("/passes/{id}/approve-return")
    public ResponseEntity<?> approveReturn(@RequestHeader(value = "role", required = false) String callerRole,
                                            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (!"ADMIN".equals(callerRole)) {
            return ResponseEntity.status(403).body("Only admins can approve return requests.");
        }
        AccessPass pass = passRepository.findById(id).orElse(null);
        if (pass == null) return ResponseEntity.notFound().build();
        if (!"PENDING".equals(pass.getReturnStatus())) {
            return ResponseEntity.badRequest().body("No pending return request for this pass.");
        }
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        pass.setReturnStatus(approve ? "APPROVED" : "REJECTED");
        return ResponseEntity.ok(passRepository.save(pass));
    }

    @GetMapping("/gate/logs")
    public List<GateEntryExit> getGateLogs() {
        return gateRepository.findAllByOrderByScanTimeDesc();
    }

    @PostMapping("/gate/scan")
    public ResponseEntity<?> scanPass(@RequestParam String passCode, @RequestParam Long securityId, @RequestParam String type) {
        String scanType = type.toUpperCase();
        if (!scanType.equals("IN") && !scanType.equals("OUT")) {
            return ResponseEntity.badRequest().body("Type must be IN or OUT.");
        }

        AccessPass pass = passRepository.findByPassCode(passCode).orElse(null);
        if (pass == null) return ResponseEntity.badRequest().body("Invalid pass code.");

        OutingRequest req = requestRepository.findById(pass.getRequestId()).orElse(null);
        if (req == null || !"APPROVED".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body("Pass is not active or request not approved.");
        }

        User user = userRepository.findById(req.getUserId()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found.");

        String currentStatus = user.getCampusStatus() == null ? "IN" : user.getCampusStatus();
        if (scanType.equals("OUT") && "OUT".equals(currentStatus)) {
            return ResponseEntity.badRequest().body("Student is already OUT.");
        }
        if (scanType.equals("IN") && "IN".equals(currentStatus)) {
            return ResponseEntity.badRequest().body("Student is already IN.");
        }
        if (scanType.equals("IN") && !"APPROVED".equals(pass.getReturnStatus())) {
            return ResponseEntity.badRequest().body("Return has not been requested and approved by admin yet.");
        }

        GateEntryExit record = new GateEntryExit();
        record.setPassId(pass.getId());
        record.setSecurityId(securityId);
        record.setScanTime(LocalDateTime.now());
        record.setType(scanType);
        gateRepository.save(record);

        if (scanType.equals("IN")) {
            pass.setActualReturnTime(record.getScanTime());
            passRepository.save(pass);
        }

        user.setCampusStatus(scanType);
        userRepository.save(user);

        return ResponseEntity.ok("Successfully marked " + scanType);
    }
}
