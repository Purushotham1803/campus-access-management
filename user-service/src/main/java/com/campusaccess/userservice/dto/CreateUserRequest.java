package com.campusaccess.userservice.dto;
import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String password;
    private String role;
    private String department;
    private Integer year;
}
