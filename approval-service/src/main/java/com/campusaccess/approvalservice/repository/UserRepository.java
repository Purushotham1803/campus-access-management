package com.campusaccess.approvalservice.repository;
import com.campusaccess.approvalservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {}
