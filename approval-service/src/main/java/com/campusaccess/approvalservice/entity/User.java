package com.campusaccess.approvalservice.entity;
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
