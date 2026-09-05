package com.campusaccess.accessservice.entity;
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
