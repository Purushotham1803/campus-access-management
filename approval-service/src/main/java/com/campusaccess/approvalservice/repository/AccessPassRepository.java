package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.AccessPass;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AccessPassRepository extends JpaRepository<AccessPass, Long> {}
