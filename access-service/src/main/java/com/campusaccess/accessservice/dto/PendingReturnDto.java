package com.campusaccess.accessservice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PendingReturnDto {
    private Long passId;
    private Long requestId;
    private String username;
    private String destination;
    private LocalDateTime expectedReturnTime;
    private LocalDateTime returnRequestedAt;
}
