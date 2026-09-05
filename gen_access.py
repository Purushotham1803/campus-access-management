import os

def create_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'access-service/src/main/java/com/campusaccess/accessservice'

# Entities
outing_request = """package com.campusaccess.accessservice.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "outing_requests")
public class OutingRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String type; // LOCAL, NON_LOCAL
    private String reason;
    private String destination;
    @Column(name = "departure_time")
    private LocalDateTime departureTime;
    @Column(name = "return_time")
    private LocalDateTime returnTime;
    private String status; // PENDING, APPROVED, REJECTED, CANCELLED, EXPIRED
}
"""
create_file(f'{base}/entity/OutingRequest.java', outing_request)

access_pass = """package com.campusaccess.accessservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "access_passes")
public class AccessPass {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "request_id", nullable = false)
    private Long requestId;
    @Column(name = "pass_code", unique = true, nullable = false)
    private String passCode;
}
"""
create_file(f'{base}/entity/AccessPass.java', access_pass)

gate_entry = """package com.campusaccess.accessservice.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "gate_entry_exit")
public class GateEntryExit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "pass_id", nullable = false)
    private Long passId;
    @Column(name = "security_id", nullable = false)
    private Long securityId;
    @Column(name = "scan_time")
    private LocalDateTime scanTime;
    private String type; // OUT, IN
}
"""
create_file(f'{base}/entity/GateEntryExit.java', gate_entry)

user_ref = """package com.campusaccess.accessservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "campus_status")
    private String campusStatus;
}
"""
create_file(f'{base}/entity/User.java', user_ref)

# Repositories
repo_req = """package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.OutingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OutingRequestRepository extends JpaRepository<OutingRequest, Long> {
    List<OutingRequest> findByUserId(Long userId);
}
"""
create_file(f'{base}/repository/OutingRequestRepository.java', repo_req)

repo_pass = """package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.AccessPass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AccessPassRepository extends JpaRepository<AccessPass, Long> {
    Optional<AccessPass> findByPassCode(String passCode);
}
"""
create_file(f'{base}/repository/AccessPassRepository.java', repo_pass)

repo_gate = """package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.GateEntryExit;
import org.springframework.data.jpa.repository.JpaRepository;
public interface GateEntryExitRepository extends JpaRepository<GateEntryExit, Long> {}
"""
create_file(f'{base}/repository/GateEntryExitRepository.java', repo_gate)

repo_user = """package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {}
"""
create_file(f'{base}/repository/UserRepository.java', repo_user)


# DTO
dto_req = """package com.campusaccess.accessservice.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class RequestDto {
    private Long userId;
    private String type;
    private String reason;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime returnTime;
}
"""
create_file(f'{base}/dto/RequestDto.java', dto_req)

# Controller
ctrl = """package com.campusaccess.accessservice.controller;
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
import java.util.List;

@RestController
@RequestMapping("/access")
public class AccessController {
    @Autowired private OutingRequestRepository requestRepository;
    @Autowired private AccessPassRepository passRepository;
    @Autowired private GateEntryExitRepository gateRepository;
    @Autowired private UserRepository userRepository;

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody RequestDto dto) {
        if ("LOCAL".equalsIgnoreCase(dto.getType())) {
            int depHour = dto.getDepartureTime().getHour();
            int retHour = dto.getReturnTime().getHour();
            if (depHour < 5 || retHour >= 21 || dto.getDepartureTime().toLocalDate().isBefore(dto.getReturnTime().toLocalDate())) {
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
    
    @GetMapping("/requests/user/{userId}")
    public List<OutingRequest> getUserRequests(@PathVariable Long userId) {
        return requestRepository.findByUserId(userId);
    }
    
    @PostMapping("/gate/scan")
    public ResponseEntity<?> scanPass(@RequestParam String passCode, @RequestParam Long securityId, @RequestParam String type) {
        AccessPass pass = passRepository.findByPassCode(passCode).orElse(null);
        if (pass == null) return ResponseEntity.badRequest().body("Invalid Pass");
        
        OutingRequest req = requestRepository.findById(pass.getRequestId()).orElse(null);
        if (req == null || !"APPROVED".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body("Pass is not active or request not approved.");
        }
        
        GateEntryExit record = new GateEntryExit();
        record.setPassId(pass.getId());
        record.setSecurityId(securityId);
        record.setScanTime(LocalDateTime.now());
        record.setType(type.toUpperCase());
        gateRepository.save(record);
        
        User user = userRepository.findById(req.getUserId()).orElse(null);
        if (user != null) {
            user.setCampusStatus(type.toUpperCase().equals("OUT") ? "OUT" : "IN");
            userRepository.save(user);
        }
        
        return ResponseEntity.ok("Successfully marked " + type);
    }
}
"""
create_file(f'{base}/controller/AccessController.java', ctrl)

# Security Config (Disable CSRF so tests can run)
sec_config = """package com.campusaccess.accessservice.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable).authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
"""
create_file(f'{base}/config/SecurityConfig.java', sec_config)

print("Access Service code generated.")
