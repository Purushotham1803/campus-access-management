package com.campusaccess.approvalservice.entity;
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

    @Column(name = "return_status", columnDefinition = "varchar(20) default 'NONE'")
    private String returnStatus = "NONE";
    @Column(name = "return_requested_at")
    private LocalDateTime returnRequestedAt;
    @Column(name = "actual_return_time")
    private LocalDateTime actualReturnTime;
}
