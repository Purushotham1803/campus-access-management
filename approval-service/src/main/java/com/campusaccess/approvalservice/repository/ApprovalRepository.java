package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findAllByOrderByIdDesc();
}
