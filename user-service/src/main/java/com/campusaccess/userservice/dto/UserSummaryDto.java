package com.campusaccess.userservice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String username;
    private String role;
    private String campusStatus;
    private String department;
    private Integer year;
}
