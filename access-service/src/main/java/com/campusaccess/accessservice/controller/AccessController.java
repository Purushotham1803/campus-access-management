package com.campusaccess.accessservice.controller;
import com.campusaccess.accessservice.dto.RequestDto;
import com.campusaccess.accessservice.entity.OutingRequest;
import com.campusaccess.accessservice.repository.OutingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/access")
public class AccessController {
    @Autowired private OutingRequestRepository requestRepository;

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

    @PostMapping("/requests/{id}/request-return")
    public ResponseEntity<?> requestReturn(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        OutingRequest req = requestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();

        Object userIdRaw = body.get("userId");
        Long userId = userIdRaw == null ? null : Long.valueOf(userIdRaw.toString());
        if (userId == null || !userId.equals(req.getUserId())) {
            return ResponseEntity.status(403).body("This request does not belong to you.");
        }
        if (!"APPROVED".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body("Only an approved outing can request a return.");
        }
        String status = req.getReturnStatus();
        if (status != null && (status.equals("PENDING") || status.equals("APPROVED"))) {
            return ResponseEntity.badRequest().body("A return request is already " + status.toLowerCase() + ".");
        }

        req.setReturnStatus("PENDING");
        req.setReturnRequestedAt(LocalDateTime.now());
        return ResponseEntity.ok(requestRepository.save(req));
    }
}
