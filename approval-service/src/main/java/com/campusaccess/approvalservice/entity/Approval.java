package com.campusaccess.approvalservice.entity;
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
