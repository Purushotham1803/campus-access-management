package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {}
