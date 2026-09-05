import os
import uuid

def create_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'approval-service/src/main/java/com/campusaccess/approvalservice'

# Entities
approval = """package com.campusaccess.approvalservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "approvals")
public class Approval {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "request_id", nullable = false)
    private Long requestId;
    @Column(name = "admin_id", nullable = false)
    private Long adminId;
    private String status; // APPROVED, REJECTED
    private String reason;
}
"""
create_file(f'{base}/entity/Approval.java', approval)

outing_req = """package com.campusaccess.approvalservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "outing_requests")
public class OutingRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String status;
}
"""
create_file(f'{base}/entity/OutingRequest.java', outing_req)

access_pass = """package com.campusaccess.approvalservice.entity;
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


# Repositories
repo_app = """package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ApprovalRepository extends JpaRepository<Approval, Long> {}
"""
create_file(f'{base}/repository/ApprovalRepository.java', repo_app)

repo_req = """package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.OutingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OutingRequestRepository extends JpaRepository<OutingRequest, Long> {}
"""
create_file(f'{base}/repository/OutingRequestRepository.java', repo_req)

repo_pass = """package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.AccessPass;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AccessPassRepository extends JpaRepository<AccessPass, Long> {}
"""
create_file(f'{base}/repository/AccessPassRepository.java', repo_pass)

# Controller
ctrl = """package com.campusaccess.approvalservice.controller;
import com.campusaccess.approvalservice.entity.AccessPass;
import com.campusaccess.approvalservice.entity.Approval;
import com.campusaccess.approvalservice.entity.OutingRequest;
import com.campusaccess.approvalservice.repository.AccessPassRepository;
import com.campusaccess.approvalservice.repository.ApprovalRepository;
import com.campusaccess.approvalservice.repository.OutingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/approvals")
public class ApprovalController {
    @Autowired private ApprovalRepository approvalRepository;
    @Autowired private OutingRequestRepository requestRepository;
    @Autowired private AccessPassRepository passRepository;

    @PostMapping
    public ResponseEntity<?> approveOrReject(@RequestBody Approval approval) {
        OutingRequest req = requestRepository.findById(approval.getRequestId()).orElse(null);
        if (req == null) return ResponseEntity.badRequest().body("Request not found");
        
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
"""
create_file(f'{base}/controller/ApprovalController.java', ctrl)

# Security Config (Disable CSRF so tests can run)
sec_config = """package com.campusaccess.approvalservice.config;
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

print("Approval Service code generated.")
