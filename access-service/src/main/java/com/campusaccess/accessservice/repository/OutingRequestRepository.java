package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.OutingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OutingRequestRepository extends JpaRepository<OutingRequest, Long> {
    List<OutingRequest> findByUserId(Long userId);
    List<OutingRequest> findAllByOrderByIdDesc();
}
