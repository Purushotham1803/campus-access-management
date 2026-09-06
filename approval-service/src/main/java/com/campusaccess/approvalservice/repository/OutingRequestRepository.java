package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.OutingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OutingRequestRepository extends JpaRepository<OutingRequest, Long> {
    List<OutingRequest> findByStatusOrderByIdDesc(String status);
    List<OutingRequest> findByStatusAndReturnStatusOrderByReturnRequestedAtAsc(String status, String returnStatus);
}
