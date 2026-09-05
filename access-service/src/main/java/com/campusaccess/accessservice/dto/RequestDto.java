package com.campusaccess.accessservice.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class RequestDto {
    private Long userId;
    private String type;
    private String reason;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime returnTime;
}
