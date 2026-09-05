package com.campusaccess.approvalservice.entity;
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
