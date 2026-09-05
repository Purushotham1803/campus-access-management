package com.campusaccess.userservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "faculty")
public class Faculty {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    private String department;
}
