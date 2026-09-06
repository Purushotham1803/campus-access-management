package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.AccessPass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface AccessPassRepository extends JpaRepository<AccessPass, Long> {
    Optional<AccessPass> findByPassCode(String passCode);
    Optional<AccessPass> findByRequestId(Long requestId);
    List<AccessPass> findByReturnStatusOrderByReturnRequestedAtAsc(String returnStatus);
}
