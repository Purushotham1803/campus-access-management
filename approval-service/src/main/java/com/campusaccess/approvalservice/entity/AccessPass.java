package com.campusaccess.approvalservice.entity;
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
    @Column(name = "return_status", columnDefinition = "varchar(20) default 'NONE'")
    private String returnStatus = "NONE";
    @Column(name = "return_requested_at")
    private LocalDateTime returnRequestedAt;
    @Column(name = "actual_return_time")
    private LocalDateTime actualReturnTime;
}
