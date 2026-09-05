package com.campusaccess.userservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String role; // STUDENT, FACULTY, ADMIN, SECURITY
    @Column(name = "campus_status")
    private String campusStatus = "IN"; // IN, OUT
}
