package com.campusaccess.accessservice.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
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
    // NONE, PENDING, APPROVED, REJECTED — student must request and get admin
    // approval to re-enter; gate IN scans are blocked until this is APPROVED.
    @Column(name = "return_status", columnDefinition = "varchar(20) default 'NONE'")
    private String returnStatus = "NONE";
    @Column(name = "return_requested_at")
    private LocalDateTime returnRequestedAt;
    @Column(name = "actual_return_time")
    private LocalDateTime actualReturnTime;
}
